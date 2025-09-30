using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Realstate_servcices.Server.Data; // Add this
using Realstate_servcices.Server.Dto.Jwt;
using Realstate_servcices.Server.Repository.OTP;
using Realstate_servcices.Server.Repository.UserDAO;
using Realstate_servcices.Server.Services.Authentication;
using Realstate_servcices.Server.Services.ProfileCreation;
using Realstate_servcices.Server.Services.Security;
using Realstate_servcices.Server.Services.SMTP.interfaces;
using Realstate_servcices.Server.Services.SMTP.rollout;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

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

// JWT Configuration - must come before services that use it
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



// Add JWT Authentication
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
        RequireExpirationTime = false, // Set to true if you want to require expiration
        ValidIssuer = builder.Configuration["JwtConfig:Issuer"],
        ValidAudience = builder.Configuration["JwtConfig:Audience"],
        ClockSkew = TimeSpan.Zero // Remove delay of token when expire
    };
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// CORS must come before Authentication and Authorization
app.UseCors("BethelandPolicy");

// Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapFallbackToFile("/index.html");

app.Run();