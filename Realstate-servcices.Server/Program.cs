using AutoMapper;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Realstate_servcices.Server.Controllers.convo;
using Realstate_servcices.Server.Controllers.Security;
using Realstate_servcices.Server.Data;
using Realstate_servcices.Server.Dto.Chat;
using Realstate_servcices.Server.Dto.Jwt;
using Realstate_servcices.Server.Entity.Chat;
using Realstate_servcices.Server.Entity.Member;

using Realstate_servcices.Server.Repositories;
using Realstate_servcices.Server.Repository.ContentLandingPage;
using Realstate_servcices.Server.Repository.Conversation;
using Realstate_servcices.Server.Repository.DeviceInfoRepository;
using Realstate_servcices.Server.Repository.OTP;
using Realstate_servcices.Server.Repository.Properties;
using Realstate_servcices.Server.Repository.Ratings;
using Realstate_servcices.Server.Repository.ScheduleDao;
using Realstate_servcices.Server.Repository.UserDAO;
using Realstate_servcices.Server.Repository.WishRepo;
using Realstate_servcices.Server.Services.Authentication;
using Realstate_servcices.Server.Services.ConfigLandingpage;
using Realstate_servcices.Server.Services.Conversation;
using Realstate_servcices.Server.Services.Device;
using Realstate_servcices.Server.Services.Ipaddress;
using Realstate_servcices.Server.Services.ProfileCreation;
using Realstate_servcices.Server.Services.PropertyCreation;
using Realstate_servcices.Server.Services.Ratings;
using Realstate_servcices.Server.Services.Scheduling;
using Realstate_servcices.Server.Services.Security;
using Realstate_servcices.Server.Services.SMTP.interfaces;
using Realstate_servcices.Server.Services.SMTP.rollout;
using Realstate_servcices.Server.Services.Wishlist;
using Realstate_servcices.Server.Utilities.Storage;
using System.Text;
using System.Text.Json.Serialization;
using static Realstate_servcices.Server.Repository.DeviceInfoRepository.IDeviceInfoRepository;
using static Realstate_servcices.Server.Services.Scheduling.ISchedulePropertiesService;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddLogging();

// Enhanced SignalR Service Configuration
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
    options.MaximumReceiveMessageSize = 1024000; // 1MB
    options.StreamBufferCapacity = 10;
    options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
    options.KeepAliveInterval = TimeSpan.FromSeconds(15);
    options.HandshakeTimeout = TimeSpan.FromSeconds(15);
})
.AddJsonProtocol(options =>
{
    options.PayloadSerializerOptions.PropertyNamingPolicy = null;
    options.PayloadSerializerOptions.WriteIndented = false;
    options.PayloadSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});

// Enhanced CORS Configuration for WebSocket Support
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins(
            "https://localhost:3000",
            "https://localhost:5173",
            "https://localhost:64324",
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:64324",
            "https://betheland.tryasp.net",
            "https://betheland.runasp.net",
            "wss://localhost:3000",
            "wss://localhost:5173",
            "ws://localhost:3000",
            "ws://localhost:5173"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials()
        .WithExposedHeaders("Content-Disposition")
        .SetPreflightMaxAge(TimeSpan.FromMinutes(10));
    });
});

// URL Configuration
if (builder.Environment.IsDevelopment())
{
    builder.WebHost.UseUrls("https://localhost:7080", "http://localhost:5016");
}
else
{
    builder.WebHost.UseUrls("https://betheland.com", "http://betheland.com");
}

// Database Configuration
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// JWT Configuration
builder.Services.Configure<JwtConfig>(builder.Configuration.GetSection("JwtConfig"));

// Service Registrations
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IOTPRepository, OTPRepository>();
builder.Services.AddScoped<IOTPService, OTPService>();
builder.Services.AddScoped<IBaseMemberRepository, BaseMemberRepository>();
builder.Services.AddScoped<IAgentRepository, AgentRepository>();
builder.Services.AddScoped<IClientRepository, ClientRepository>();
builder.Services.AddScoped<IAgentService, AgentService>();
builder.Services.AddScoped<IClientService, ClientService>();
builder.Services.AddScoped<IPasswordResetService, PasswordResetService>();
builder.Services.AddScoped<ICreatePropertyRepository, CreatePropertyRepository>();
builder.Services.AddScoped<ILocalstorageImage, LocalStorageImage>();
builder.Services.AddScoped<ICreatePropertyService, CreatePropertyService>();
builder.Services.AddScoped<IWishlistRepository, WishlistRepository>();
builder.Services.AddScoped<IWishlistService, WishlistService>();
builder.Services.AddScoped<IProfilePictureService, ProfilePictureService>();
builder.Services.AddScoped<ILocalStorageVideo, LocalStorageVideo>();
builder.Services.AddScoped<IChatRepository, ChatRepository>();
builder.Services.AddScoped<IMessageRepository, MessageRepository>();
builder.Services.AddScoped<IChatParticipantRepository, ChatParticipantRepository>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<IChatService, ChatService>();
builder.Services.AddScoped<IMessageService, MessageService>();
builder.Services.AddScoped<IFileStorageService, FileStorageService>();
builder.Services.AddScoped<ILocalStorageChatImage, LocalStorageChatImage>();
builder.Services.AddScoped<ILocalStorageChatVideo, LocalStorageChatVideo>();
builder.Services.AddScoped<ISchedulePropertiesService, SchedulePropertiesService>();
builder.Services.AddScoped<IAgentTimeOffService, AgentTimeOffService>();
builder.Services.AddScoped<IAgentScheduleConfigService, AgentScheduleConfigService>();
builder.Services.AddScoped<IAgentAvailabilityService, AgentAvailabilityService>();
builder.Services.AddScoped<ISchedulePropertiesRepository, SchedulePropertiesRepository>();
builder.Services.AddScoped<IAgentTimeOffRepository, AgentTimeOffRepository>();
builder.Services.AddScoped<IAgentScheduleConfigRepository, AgentScheduleConfigRepository>();
builder.Services.AddScoped<IAgentAvailabilityRepository, AgentAvailabilityRepository>();
builder.Services.AddScoped<IChatService, ChatService>();
builder.Services.AddScoped<IMessageService, MessageService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<INotificationPreferenceRepository, NotificationPreferenceRepository>();
builder.Services.AddScoped<IBaseMemberRepository, BaseMemberRepository>();
builder.Services.AddScoped<IRatingRepository, RatingRepository>();
builder.Services.AddScoped<IRatingService, RatingService>();
builder.Services.AddScoped<IRatingSchedulesRepository, RatingSchedulesRepository>();
builder.Services.AddScoped<IRatingSchedulesServices, RatingSchedulesServices>();
builder.Services.AddScoped<IDeviceInfoRepository, DeviceInfoRepository>();
builder.Services.AddScoped<IDeviceInfoService, DeviceInfoService>();
builder.Services.AddScoped<IIPAddressService, IPAddressService>();
builder.Services.AddScoped<ISystemInformationService, SystemInformationService>();
builder.Services.AddScoped<IThirdSectionRepository, ThirdSectionRepository>();
builder.Services.AddScoped<IThirdSectionServices, ThirdSectionServices>();
builder.Services.AddScoped<IPartnershipContentRepository, PartnershipContentRepository>();
builder.Services.AddScoped<IPartnershipContentService, PartnershipContentService>();
builder.Services.AddScoped<IAnnouncementRepository, AnnouncementRepository>();
builder.Services.AddScoped<IAnnouncementService, AnnouncementService>();
builder.Services.AddScoped<ILocalstorageImage, LocalStorageImage>();
builder.Services.AddScoped<ILogoStorage, LocalStorageImage>();
builder.Services.AddScoped<IPartnerLogoService, PartnerLogoService>();
builder.Services.AddScoped<IPartnershipContentService, PartnershipContentService>();
builder.Services.AddLogging();
// Controllers with JSON Options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });


builder.Services.AddSession(
        options => { 
        
        options.IdleTimeout = TimeSpan.FromMinutes(30);
        options.Cookie.HttpOnly = true;
        options.Cookie.IsEssential = true;
        options.Cookie.SameSite = SameSiteMode.Lax; 
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always;    


        }
        
    );

// Enhanced Authentication Configuration with SignalR Support
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

    // Enhanced SignalR JWT Support for WebSocket connections
    jwt.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;

            Console.WriteLine($"🔐 SignalR Path: {path}, Token Present: {!string.IsNullOrEmpty(accessToken)}");

            // For SignalR WebSocket connections - support multiple paths
            if (!string.IsNullOrEmpty(accessToken) &&
                (path.StartsWithSegments("/chatHub") ||
                 path.StartsWithSegments("/ws") ||
                 path.StartsWithSegments("/hubs/chat")))
            {
                context.Token = accessToken;
                Console.WriteLine($"✅ WebSocket token applied for path: {path}");
            }
            // For HTTP requests with Authorization header
            else if (context.Request.Headers.ContainsKey("Authorization"))
            {
                var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
                if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
                {
                    context.Token = authHeader.Substring("Bearer ".Length);
                }
            }

            return Task.CompletedTask;
        },
        OnAuthenticationFailed = context =>
        {
            Console.WriteLine($"🔐 Authentication failed: {context.Exception.Message}");
            Console.WriteLine($"🔐 Path: {context.HttpContext.Request.Path}");

            // Don't throw exception for SignalR to allow connection attempts
            if (context.HttpContext.Request.Path.StartsWithSegments("/chatHub") ||
                context.HttpContext.Request.Path.StartsWithSegments("/ws"))
            {
                context.NoResult();
                context.Response.StatusCode = 200;
                Console.WriteLine($"🔐 SignalR auth failure handled gracefully");
            }
            return Task.CompletedTask;
        },
        OnChallenge = context =>
        {
            Console.WriteLine($"🔐 Authentication challenge for: {context.Request.Path}");
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDistributedMemoryCache();


// File Upload Configuration
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 104857600; // 100MB
    options.ValueLengthLimit = int.MaxValue;
    options.MultipartHeadersLengthLimit = int.MaxValue;
});

// SPA Static Files
builder.Services.AddSpaStaticFiles(configuration =>
{
    configuration.RootPath = "wwwroot";
});

// Kestrel Configuration for WebSocket support
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Limits.MaxConcurrentConnections = 100;
    serverOptions.Limits.MaxConcurrentUpgradedConnections = 100;
    serverOptions.Limits.MaxRequestBodySize = 100 * 1024 * 1024; 
    serverOptions.AllowSynchronousIO = true;
});

// IIS Configuration
builder.Services.Configure<IISServerOptions>(options =>
{
    options.MaxRequestBodySize = 100 * 1024 * 1024; 
    options.AllowSynchronousIO = true;
});

var app = builder.Build();

// Create wwwroot and uploads directories
var webRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
if (!Directory.Exists(webRootPath))
{
    Directory.CreateDirectory(webRootPath);
    Console.WriteLine($"Created wwwroot directory at: {webRootPath}");
}

var uploadsPath = Path.Combine(webRootPath, "uploads");
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
    Console.WriteLine($"Created uploads directory at: {uploadsPath}");
}

// Development Configuration
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
    app.UseStaticFiles();
    app.UseSpaStaticFiles();
}

// Enhanced WebSocket Configuration
app.UseWebSockets(new WebSocketOptions
{
    KeepAliveInterval = TimeSpan.FromSeconds(30),
    ReceiveBufferSize = 4 * 1024,
    AllowedOrigins = {
        "https://localhost:5173",
        "https://localhost:7080",
        "https://localhost:64324",
        "https://localhost:3000",
        "http://localhost:3000"
    }
});

// ✅ CORRECT MIDDLEWARE ORDER - FIXED VERSION:

// 1. HTTPS Redirection
app.UseHttpsRedirection();
app.UseCors("AllowReactApp");
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, "wwwroot")),
    RequestPath = ""
});
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.UseSession();   

// 6. Endpoint Routing with Multiple SignalR Hubs
app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();
    endpoints.MapHub<ChatHub>("/chatHub");
    endpoints.MapHub<ChatHub>("/ws");
    endpoints.MapHub<ChatHub>("/hubs/chat");
});



app.Run();