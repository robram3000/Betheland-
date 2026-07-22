using Microsoft.AspNetCore.Http.Features;
using Microsoft.Extensions.FileProviders;
using Realstate_servcices.Server.Controllers.convo;
using Realstate_servcices.Server.Data;
using Realstate_servcices.Server.Extensions;
using System.Text.Json.Serialization;

/// <summary>
/// Main entry point for the Real Estate Services application.
/// Configures services, middleware, and the HTTP request pipeline.
/// </summary>
var builder = WebApplication.CreateBuilder(args);

// ==================== LOGGING CONFIGURATION ====================
builder.Services.AddLogging();

// ==================== URL CONFIGURATION ====================
// Configure listening URLs based on environment
if (builder.Environment.IsDevelopment())
{
    builder.WebHost.UseUrls("https://localhost:7080", "http://localhost:5016");
}
else
{
    builder.WebHost.UseUrls("https://betheland.com", "http://betheland.com");
}

// ==================== KESTREL CONFIGURATION ====================
// Optimize for WebSocket support and large file uploads
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Limits.MaxConcurrentConnections = 100;                 // Max concurrent connections
    serverOptions.Limits.MaxConcurrentUpgradedConnections = 100;         // Max WebSocket connections
    serverOptions.Limits.MaxRequestBodySize = 100 * 1024 * 1024;         // 100MB max request body
    serverOptions.AllowSynchronousIO = true;                             // Allow synchronous I/O
});

// ==================== IIS CONFIGURATION ====================
// Configure for IIS hosting
builder.Services.Configure<IISServerOptions>(options =>
{
    options.MaxRequestBodySize = 100 * 1024 * 1024;                      // 100MB max request body
    options.AllowSynchronousIO = true;                                   // Allow synchronous I/O
});

// ==================== FILE UPLOAD CONFIGURATION ====================
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 104857600;                        // 100MB multipart limit
    options.ValueLengthLimit = int.MaxValue;                             // No value length limit
    options.MultipartHeadersLengthLimit = int.MaxValue;                  // No header length limit
});

// ==================== SPA STATIC FILES ====================
builder.Services.AddSpaStaticFiles(configuration =>
{
    configuration.RootPath = "wwwroot";                                  // Serve SPA from wwwroot
});

// ==================== INFRASTRUCTURE SERVICES ====================
builder.Services.AddInfrastructure(builder.Configuration);               // Database, JWT, Session

// ==================== CORS CONFIGURATION ====================
builder.Services.AddCorsWithWebSocketSupport();                          // CORS with WebSocket support

// ==================== SIGNALR CONFIGURATION ====================
builder.Services.AddSignalRWithConfiguration();                          // Real-time communication

// ==================== AUTHENTICATION ====================
builder.Services.AddJwtAuthentication(builder.Configuration);            // JWT bearer authentication

// ==================== DATA ACCESS LAYER ====================
builder.Services.AddRepositories();                                      // Register all repositories

// ==================== BUSINESS LOGIC LAYER ====================
builder.Services.AddApplicationServices();                               // Register all services

// ==================== FILE STORAGE ====================
builder.Services.AddFileStorage();                                       // Register file storage services

// ==================== API EXPLORER & SWAGGER ====================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ==================== CONTROLLERS ====================
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles; // Prevent circular references
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull; // Ignore null properties
    });

// ==================== BUILD APPLICATION ====================
var app = builder.Build();

// ==================== ENSURE DIRECTORY STRUCTURE ====================
var webRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
if (!Directory.Exists(webRootPath)) Directory.CreateDirectory(webRootPath);

var uploadsPath = Path.Combine(webRootPath, "uploads");
if (!Directory.Exists(uploadsPath)) Directory.CreateDirectory(uploadsPath);

// ==================== WEBSOCKET CONFIGURATION ====================
app.UseWebSockets(new WebSocketOptions
{
    KeepAliveInterval = TimeSpan.FromSeconds(30),                       // Ping interval
    ReceiveBufferSize = 4 * 1024,                                        // 4KB receive buffer
    AllowedOrigins = {
        "https://localhost:5173",                                       // Vite dev server
        "https://localhost:7080",                                       // API server
        "https://localhost:64324",                                      // Alternative port
        "https://localhost:3000",                                       // React dev server
        "http://localhost:3000"                                         // React dev server HTTP
    }
});

// ==================== HTTP PIPELINE ====================
app.UseApplicationMiddleware(app.Environment);                          // Configure middleware pipeline

// ==================== ENDPOINT MAPPING ====================
app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();                                          // Map API controllers
    endpoints.MapSignalRHubs();                                          // Map SignalR hubs
});

// ==================== START APPLICATION ====================
app.Run();