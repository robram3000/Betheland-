using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Realstate_servcices.Server.Data;
using Realstate_servcices.Server.Dto.Jwt;
using Realstate_servcices.Server.Repository.OTP;
using Realstate_servcices.Server.Repository.Properties;
using Realstate_servcices.Server.Repository.UserDAO;
using Realstate_servcices.Server.Services.Authentication;
using Realstate_servcices.Server.Services.ProfileCreation;
using Realstate_servcices.Server.Services.PropertyCreation;
using Realstate_servcices.Server.Services.Security;
using Realstate_servcices.Server.Services.SMTP.interfaces;
using Realstate_servcices.Server.Services.SMTP.rollout;
using Realstate_servcices.Server.Utilities.Storage;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add IWebHostEnvironment - This is automatically available in WebApplication.Builder
// The issue might be elsewhere, let's check the registration order

// Configure CORS
var allowedOrigins = builder.Configuration["Cors:AllowedOrigins"] ?? "https://localhost:52090";
builder.Services.AddCors(options =>
{
    options.AddPolicy("BethelandPolicy", policy =>
    {
        policy.WithOrigins("https://localhost:7074", "https://localhost:52090", "http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.WebHost.UseUrls("https://localhost:7074", "http://localhost:5015");

// Add DbContext with SQL Server
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// JWT Configuration
builder.Services.Configure<JwtConfig>(builder.Configuration.GetSection("JwtConfig"));

// Add JWT Service
builder.Services.AddScoped<IJwtService, JwtService>();

// Email and OTP Services
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IOTPRepository, OTPRepository>();
builder.Services.AddScoped<IOTPService, OTPService>();

// Add repositories
builder.Services.AddScoped<IBaseMemberRepository, BaseMemberRepository>();
builder.Services.AddScoped<IAgentRepository, AgentRepository>();
builder.Services.AddScoped<IClientRepository, ClientRepository>();

// Add services
builder.Services.AddScoped<IAgentService, AgentService>();
builder.Services.AddScoped<IClientService, ClientService>();
builder.Services.AddScoped<IPasswordResetService, PasswordResetService>();

// Property services - Make sure these are registered AFTER IWebHostEnvironment is available
builder.Services.AddScoped<ICreatePropertyRepository, CreatePropertyRepository>();
builder.Services.AddScoped<ILocalstorageImage, LocalStorageImage>(); // This depends on IWebHostEnvironment
builder.Services.AddScoped<ICreatePropertyService, CreatePropertyService>();

// The rest of your configuration remains the same...
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(jwt =>
{
    var key = Encoding.ASCII.GetBytes(builder.Configuration["JwtConfig:Secret"] ??
        throw new InvalidOperationException("JWT Secret is not configured"));

    jwt.SaveToken = true;
    jwt.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        RequireExpirationTime = false,
        ValidIssuer = builder.Configuration["JwtConfig:Issuer"],
        ValidAudience = builder.Configuration["JwtConfig:Audience"],
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles(); // This is important for LocalStorageImage to work

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("BethelandPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapFallbackToFile("/index.html");

app.Run();