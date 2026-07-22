using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Realstate_servcices.Server.Controllers.convo;
using Realstate_servcices.Server.Data;
using Realstate_servcices.Server.Dto.Jwt;
using Realstate_servcices.Server.Utilities.Storage;
using Realstate_servcices.Server.Utilities.Storage.Interfaces;
using System.Text;
using System.Text.Json.Serialization;

namespace Realstate_servcices.Server.Extensions
{
    /// <summary>
    /// Provides comprehensive extension methods for configuring HTTP infrastructure,
    /// authentication, SignalR, CORS, and the application pipeline.
    /// </summary>
    public static class HttpExtension
    {
        /// <summary>
        /// Registers core infrastructure services including database context, JWT configuration,
        /// distributed cache, and session management.
        /// </summary>
        /// <param name="services">The service collection to add services to.</param>
        /// <param name="configuration">Application configuration for retrieving connection strings and settings.</param>
        /// <returns>The service collection for chaining.</returns>
        /// <exception cref="InvalidOperationException">Thrown when database connection string is missing.</exception>
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            // ==================== DATABASE CONFIGURATION ====================
            // Configure Entity Framework with SQL Server
            var connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Database connection string 'DefaultConnection' not found.");

            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(connectionString));

            // ==================== JWT CONFIGURATION ====================
            // Load JWT settings from configuration
            services.Configure<JwtConfig>(configuration.GetSection("JwtConfig"));

            // ==================== DISTRIBUTED CACHE ====================
            // In-memory cache for session state and temporary data
            services.AddDistributedMemoryCache();

            // ==================== SESSION CONFIGURATION ====================
            // Configure HTTP session state
            services.AddSession(options =>
            {
                options.IdleTimeout = TimeSpan.FromMinutes(30);      // Session expires after 30 minutes of inactivity
                options.Cookie.HttpOnly = true;                      // Prevent JavaScript access to session cookie
                options.Cookie.IsEssential = true;                   // GDPR: cookie is essential for app function
                options.Cookie.SameSite = SameSiteMode.Lax;          // Allow cookies with top-level navigations
                options.Cookie.SecurePolicy = CookieSecurePolicy.Always; // HTTPS only in production
            });

            return services;
        }

        /// <summary>
        /// Registers file storage services for handling images, videos, and chat media.
        /// </summary>
        /// <param name="services">The service collection to add services to.</param>
        /// <returns>The service collection for chaining.</returns>
        public static IServiceCollection AddFileStorage(this IServiceCollection services)
        {
            // ==================== LOCAL STORAGE SERVICES ====================
            // Each storage type has dedicated service for organization
            services.AddScoped<ILocalstorageImage, LocalStorageImage>();           // General image storage
            services.AddScoped<ILocalStorageVideo, LocalStorageVideo>();           // General video storage
            services.AddScoped<ILocalStorageChatImage, LocalStorageChatImage>();   // Chat-specific images
            services.AddScoped<ILocalStorageChatVideo, LocalStorageChatVideo>();   // Chat-specific videos
            services.AddScoped<ILogoStorage, LocalStorageImage>();                 // Brand logo storage
            services.AddScoped<IFileStorageService, FileStorageService>();         // Unified file service

            return services;
        }

        /// <summary>
        /// Configures SignalR with optimized settings for real-time communication.
        /// Includes detailed error handling, message size limits, and JSON serialization options.
        /// </summary>
        /// <param name="services">The service collection to add SignalR to.</param>
        /// <returns>The service collection for chaining.</returns>
        public static IServiceCollection AddSignalRWithConfiguration(this IServiceCollection services)
        {
            services.AddSignalR(options =>
            {
                // ==================== CONNECTION SETTINGS ====================
                options.EnableDetailedErrors = true;                    // Detailed errors for debugging
                options.MaximumReceiveMessageSize = 1024000;            // 1MB max message size
                options.StreamBufferCapacity = 10;                      // Stream buffer size

                // ==================== TIMEOUT SETTINGS ====================
                options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);  // Client disconnects after 30s no response
                options.KeepAliveInterval = TimeSpan.FromSeconds(15);      // Ping clients every 15s
                options.HandshakeTimeout = TimeSpan.FromSeconds(15);       // Handshake must complete in 15s
            })
            .AddJsonProtocol(options =>
            {
                // ==================== JSON SERIALIZATION ====================
                options.PayloadSerializerOptions.PropertyNamingPolicy = null;      // Preserve property names
                options.PayloadSerializerOptions.WriteIndented = false;            // Minimize payload size
                options.PayloadSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles; // Prevent circular references
            });

            return services;
        }

        /// <summary>
        /// Configures CORS policy with support for multiple origins including local development
        /// and production domains. Includes WebSocket support for SignalR connections.
        /// </summary>
        /// <param name="services">The service collection to add CORS to.</param>
        /// <returns>The service collection for chaining.</returns>
        public static IServiceCollection AddCorsWithWebSocketSupport(this IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddPolicy("AllowReactApp", policy =>
                {
                    // ==================== ALLOWED ORIGINS ====================
                    // Development environments
                    policy.WithOrigins(
                        "https://localhost:3000",      // React default
                        "https://localhost:5173",      // Vite default
                        "https://localhost:64324",     // Alternative port
                        "http://localhost:3000",
                        "http://localhost:5173",
                        "http://localhost:64324",
                        // Production domains
                        "https://betheland.tryasp.net",
                        "https://betheland.runasp.net",
                        // WebSocket origins
                        "wss://localhost:3000",
                        "wss://localhost:5173",
                        "ws://localhost:3000",
                        "ws://localhost:5173"
                    )
                    // ==================== CORS OPTIONS ====================
                    .AllowAnyHeader()                   // Allow all headers
                    .AllowAnyMethod()                    // Allow all HTTP methods
                    .AllowCredentials()                   // Allow cookies/auth headers
                    .WithExposedHeaders("Content-Disposition") // Expose file download headers
                    .SetPreflightMaxAge(TimeSpan.FromMinutes(10)); // Cache preflight requests
                });
            });

            return services;
        }

        /// <summary>
        /// Configures JWT Bearer authentication with support for both HTTP and WebSocket connections.
        /// Includes custom event handlers for SignalR token extraction from query strings.
        /// </summary>
        /// <param name="services">The service collection to add authentication to.</param>
        /// <param name="configuration">Application configuration containing JWT settings.</param>
        /// <returns>The service collection for chaining.</returns>
        /// <exception cref="InvalidOperationException">Thrown when JWT secret is not configured.</exception>
        public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
        {
            // ==================== JWT SECRET KEY ====================
            var secret = configuration["JwtConfig:Secret"]
                ?? throw new InvalidOperationException("JWT Secret is not configured in app settings");
            var key = Encoding.ASCII.GetBytes(secret);

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(jwt =>
            {
                // ==================== TOKEN VALIDATION ====================
                jwt.SaveToken = true;
                jwt.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    RequireExpirationTime = false,
                    ValidIssuer = configuration["JwtConfig:Issuer"],
                    ValidAudience = configuration["JwtConfig:Audience"],
                    ClockSkew = TimeSpan.Zero // No tolerance for token expiration
                };

                // ==================== CUSTOM JWT EVENTS ====================
                jwt.Events = new JwtBearerEvents
                {
                    // Handle token extraction for SignalR WebSocket connections
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"];
                        var path = context.HttpContext.Request.Path;

                        // SignalR WebSocket connections send token as query parameter
                        if (!string.IsNullOrEmpty(accessToken) &&
                            (path.StartsWithSegments("/chatHub") ||
                             path.StartsWithSegments("/ws") ||
                             path.StartsWithSegments("/hubs/chat")))
                        {
                            context.Token = accessToken;
                        }
                        // Standard HTTP Authorization header
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
                    // Gracefully handle authentication failures for SignalR
                    OnAuthenticationFailed = context =>
                    {
                        if (context.HttpContext.Request.Path.StartsWithSegments("/chatHub") ||
                            context.HttpContext.Request.Path.StartsWithSegments("/ws"))
                        {
                            context.NoResult(); // Don't return 401 for WebSocket
                            context.Response.StatusCode = 200; // Allow connection attempt
                        }
                        return Task.CompletedTask;
                    }
                };
            });

            return services;
        }

        /// <summary>
        /// Configures the HTTP request pipeline with proper middleware order.
        /// Includes environment-specific configurations for development and production.
        /// </summary>
        /// <param name="app">The application builder to configure.</param>
        /// <param name="env">The hosting environment.</param>
        /// <returns>The application builder for chaining.</returns>
        public static IApplicationBuilder UseApplicationMiddleware(this IApplicationBuilder app, IWebHostEnvironment env)
        {
            // ==================== DEVELOPMENT-ONLY MIDDLEWARE ====================
            if (env.IsDevelopment())
            {
                app.UseSwagger();                       // API documentation
                app.UseSwaggerUI();                      // Swagger UI interface
                app.UseDeveloperExceptionPage();         // Detailed error pages
            }
            else
            {
                // ==================== PRODUCTION MIDDLEWARE ====================
                app.UseExceptionHandler("/Error");       // Custom error handling
                app.UseHsts();                            // HTTP Strict Transport Security
                app.UseStaticFiles();                      // Serve static files
                app.UseSpaStaticFiles();                   // Serve SPA static files
            }

            // ==================== CORE MIDDLEWARE (ORDER IS CRITICAL) ====================
            app.UseHttpsRedirection();                     // Redirect HTTP to HTTPS
            app.UseCors("AllowReactApp");                  // Apply CORS policy

            // Static files with explicit configuration
            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new PhysicalFileProvider(
                    Path.Combine(env.ContentRootPath, "wwwroot")),
                RequestPath = ""                             // Serve from root
            });

            app.UseRouting();                               // Route matching
            app.UseAuthentication();                         // Identity verification
            app.UseAuthorization();                          // Access control
            app.UseSession();                                // Session state

            return app;
        }

        /// <summary>
        /// Maps SignalR hubs to multiple endpoints for backward compatibility.
        /// Supports multiple paths for the same hub to accommodate different client configurations.
        /// </summary>
        /// <param name="endpoints">The endpoint route builder.</param>
        /// <returns>The endpoint route builder for chaining.</returns>
        public static IEndpointRouteBuilder MapSignalRHubs(this IEndpointRouteBuilder endpoints)
        {
            // ==================== SIGNALR HUB ENDPOINTS ====================
            // Multiple endpoints for the same hub ensure compatibility
            endpoints.MapHub<ChatHub>("/chatHub");        // Primary endpoint
            endpoints.MapHub<ChatHub>("/ws");              // WebSocket alternative
            endpoints.MapHub<ChatHub>("/hubs/chat");       // Alternative path

            return endpoints;
        }
    }
}