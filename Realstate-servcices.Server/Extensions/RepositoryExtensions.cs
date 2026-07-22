using Realstate_servcices.Server.Repositories;
using Realstate_servcices.Server.Repository.ContentLandingPage;
using Realstate_servcices.Server.Repository.Conversation;
using Realstate_servcices.Server.Repository.Conversation.Interfaces;
using Realstate_servcices.Server.Repository.DeviceInfoRepository;
using Realstate_servcices.Server.Repository.OTP;
using Realstate_servcices.Server.Repository.Properties;
using Realstate_servcices.Server.Repository.Ratings;
using Realstate_servcices.Server.Repository.ScheduleDao;
using Realstate_servcices.Server.Repository.UserDAO;
using Realstate_servcices.Server.Repository.WishRepo;
using static Realstate_servcices.Server.Repository.DeviceInfoRepository.IDeviceInfoRepository;

namespace Realstate_servcices.Server.Extensions
{
    /// <summary>
    /// Provides extension methods for registering repository classes in the dependency injection container.
    /// Repositories handle all database operations and data access logic.
    /// </summary>
    public static class RepositoryRegisterExtensions
    {
        /// <summary>
        /// Registers all data access repositories with the dependency injection container.
        /// Each repository is responsible for database operations for its specific entity.
        /// </summary>
        /// <param name="services">The <see cref="IServiceCollection"/> to add the repositories to.</param>
        /// <returns>The same service collection so that multiple calls can be chained.</returns>
        /// <remarks>
        /// Repositories follow the Scoped lifetime - one instance per HTTP request.
        /// This ensures consistent database context usage within a single request.
        /// </remarks>
        public static IServiceCollection AddRepositories(this IServiceCollection services)
        {
            // ==================== MEMBER REPOSITORIES ====================
            // Handle user data operations for all member types
            services.AddScoped<IBaseMemberRepository, BaseMemberRepository>(); // Common member operations
            services.AddScoped<IAgentRepository, AgentRepository>();           // Agent-specific queries
            services.AddScoped<IClientRepository, ClientRepository>();         // Client-specific queries

            // ==================== OTP REPOSITORY ====================
            // Manages one-time passwords for verification
            services.AddScoped<IOTPRepository, OTPRepository>();

            // ==================== PROPERTY REPOSITORIES ====================
            // Handle property listings and user wishlists
            services.AddScoped<ICreatePropertyRepository, CreatePropertyRepository>(); // Property CRUD
            services.AddScoped<IWishlistRepository, WishlistRepository>();             // Wishlist operations

            // ==================== CHAT REPOSITORIES ====================
            // Manage real-time conversations and notifications
            services.AddScoped<IChatRepository, ChatRepository>();                     // Chat sessions
            services.AddScoped<IMessageRepository, MessageRepository>();               // Message history
            services.AddScoped<IChatParticipantRepository, ChatParticipantRepository>(); // Chat members
            services.AddScoped<INotificationRepository, NotificationRepository>();     // User notifications
            services.AddScoped<INotificationPreferenceRepository, NotificationPreferenceRepository>(); // User settings

            // ==================== SCHEDULING REPOSITORIES ====================
            // Handle property viewings and agent availability
            services.AddScoped<ISchedulePropertiesRepository, SchedulePropertiesRepository>(); // Viewing schedules
            services.AddScoped<IAgentTimeOffRepository, AgentTimeOffRepository>();             // Time-off records
            services.AddScoped<IAgentScheduleConfigRepository, AgentScheduleConfigRepository>(); // Working hours
            services.AddScoped<IAgentAvailabilityRepository, AgentAvailabilityRepository>();   // Availability status

            // ==================== RATING REPOSITORIES ====================
            // Manage user reviews and ratings
            services.AddScoped<IRatingRepository, RatingRepository>();               // Rating records
            services.AddScoped<IRatingSchedulesRepository, RatingSchedulesRepository>(); // Schedule ratings

            // ==================== DEVICE REPOSITORY ====================
            // Track user devices for security
            services.AddScoped<IDeviceInfoRepository, DeviceInfoRepository>();

            // ==================== LANDING PAGE REPOSITORIES ====================
            // Manage marketing content and announcements
            services.AddScoped<IThirdSectionRepository, ThirdSectionRepository>();       // Landing sections
            services.AddScoped<IPartnershipContentRepository, PartnershipContentRepository>(); // Partners
            services.AddScoped<IAnnouncementRepository, AnnouncementRepository>();       // Announcements

            return services;
        }
    }
}