using Realstate_servcices.Server.Services.Authentication;
using Realstate_servcices.Server.Services.ConfigLandingpage;
using Realstate_servcices.Server.Services.Conversation;
using Realstate_servcices.Server.Services.Conversation.Interfaces;
using Realstate_servcices.Server.Services.Device;
using Realstate_servcices.Server.Services.Ipaddress;
using Realstate_servcices.Server.Services.ProfileCreation;
using Realstate_servcices.Server.Services.ProfileCreation.Interfaces;
using Realstate_servcices.Server.Services.PropertyCreation;
using Realstate_servcices.Server.Services.PropertyCreation.Interfaces;
using Realstate_servcices.Server.Services.Ratings;
using Realstate_servcices.Server.Services.Scheduling;
using Realstate_servcices.Server.Services.Security;
using Realstate_servcices.Server.Services.Security.Interfaces;
using Realstate_servcices.Server.Services.SMTP;
using Realstate_servcices.Server.Services.SMTP.interfaces;
using Realstate_servcices.Server.Services.Wishlist;

namespace Realstate_servcices.Server.Extensions
{
    /// <summary>
    /// Provides extension methods for registering application business services in the dependency injection container.
    /// This class handles all service-layer registrations including authentication, member management,
    /// property services, chat functionality, scheduling, and ratings.
    /// </summary>
    public static class ServicesExtension
    {
        /// <summary>
        /// Registers all application-level business services with the dependency injection container.
        /// Services are registered with Scoped lifetime, meaning a new instance is created per HTTP request.
        /// </summary>
        /// <param name="services">The <see cref="IServiceCollection"/> to add the services to.</param>
        /// <returns>The same service collection so that multiple calls can be chained.</returns>
        /// <remarks>
        /// This method should be called after AddInfrastructure and before building the application.
        /// All services registered here follow the Scoped lifetime pattern.
        /// </remarks>
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            // ==================== AUTHENTICATION & SECURITY SERVICES ====================
            // Handles JWT token generation, validation, and password reset functionality
            services.AddScoped<IJwtService, JwtService>();                 // JWT token operations
            services.AddScoped<IEmailService, EmailService>();             // Email communications
            services.AddScoped<IOTPService, OTPService>();                 // One-time password management
            services.AddScoped<IPasswordResetService, PasswordResetService>(); // Password reset workflows

            // ==================== MEMBER MANAGEMENT SERVICES ====================
            // Manages both agent and client profiles and operations
            services.AddScoped<IAgentService, AgentService>();             // Agent-specific operations
            services.AddScoped<IClientService, ClientService>();           // Client-specific operations

            // ==================== PROPERTY MANAGEMENT SERVICES ====================
            // Handles property creation, wishlist management, and profile pictures
            services.AddScoped<ICreatePropertyService, CreatePropertyService>(); // Property CRUD operations
            services.AddScoped<IWishlistService, WishlistService>();             // User wishlist management
            services.AddScoped<IProfilePictureService, ProfilePictureService>(); // Profile image handling

            // ==================== CHAT & COMMUNICATION SERVICES ====================
            // Real-time messaging, notifications, and file sharing in chats
            services.AddScoped<IChatService, ChatService>();               // Chat session management
            services.AddScoped<IMessageService, MessageService>();         // Message handling
            services.AddScoped<INotificationService, NotificationService>(); // Push notifications

            // ==================== SCHEDULING SERVICES ====================
            // Property viewing schedules, agent availability, and time-off management
            services.AddScoped<ISchedulePropertiesService, SchedulePropertiesService>(); // Property viewing schedules
            services.AddScoped<IAgentTimeOffService, AgentTimeOffService>();             // Agent time-off requests
            services.AddScoped<IAgentScheduleConfigService, AgentScheduleConfigService>(); // Agent working hours
            services.AddScoped<IAgentAvailabilityService, AgentAvailabilityService>();   // Real-time availability

            // ==================== RATING SERVICES ====================
            // User ratings, reviews, and feedback management
            services.AddScoped<IRatingService, RatingService>();               // General ratings
            services.AddScoped<IRatingSchedulesServices, RatingSchedulesServices>(); // Schedule-specific ratings

            // ==================== DEVICE & SYSTEM SERVICES ====================
            // Device fingerprinting, IP tracking, and system information
            services.AddScoped<IDeviceInfoService, DeviceInfoService>();       // Device identification
            services.AddScoped<IIPAddressService, IPAddressService>();         // IP geolocation
            services.AddScoped<ISystemInformationService, SystemInformationService>(); // Browser/OS detection

            // ==================== LANDING PAGE SERVICES ====================
            // Marketing content, partnerships, and announcements
            services.AddScoped<IThirdSectionServices, ThirdSectionServices>();       // Landing page sections
            services.AddScoped<IPartnershipContentService, PartnershipContentService>(); // Partner management
            services.AddScoped<IAnnouncementService, AnnouncementService>();         // System announcements
            services.AddScoped<IPartnerLogoService, PartnerLogoService>();           // Partner logo management

            return services;
        }
    }
}