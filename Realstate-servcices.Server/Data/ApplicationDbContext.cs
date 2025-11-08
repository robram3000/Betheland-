using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Realstate_servcices.Server.Entity.Chat;
using Realstate_servcices.Server.Entity.landingpage.announcementconfig;
using Realstate_servcices.Server.Entity.landingpage.PartConfig;
using Realstate_servcices.Server.Entity.landingpage.Third_Section;
using Realstate_servcices.Server.Entity.member;
using Realstate_servcices.Server.Entity.Member;
using Realstate_servcices.Server.Entity.OTP;
using Realstate_servcices.Server.Entity.Properties;
using Realstate_servcices.Server.Entity.Schedule;

namespace Realstate_servcices.Server.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<BaseMember> BaseMembers { get; set; }
        public DbSet<Agent> Agents { get; set; }
        public DbSet<Client> Clients { get; set; }
        public DbSet<Rating> Ratings { get; set; }
        public DbSet<PropertyHouse> Properties { get; set; }
        public DbSet<PropertyImage> PropertyImages { get; set; }
        public DbSet<PropertyVideo> PropertyVideos { get; set; }
        public DbSet<ScheduleProperties> ScheduleProperties { get; set; }
        public DbSet<WishlistProperties> Wishlists { get; set; }
        public DbSet<OTPRecord> OTPRecords { get; set; }

        public DbSet<Chat> Chats { get; set; }
        public DbSet<ChatParticipant> ChatParticipants { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<MessageFile> MessageFiles { get; set; }
        public DbSet<MessageReaction> MessageReactions { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<NotificationPreference> NotificationPreferences { get; set; }

        // Schedule-related DbSets
        public DbSet<AgentAvailability> AgentAvailabilities { get; set; }
        public DbSet<AgentTimeOff> AgentTimeOffs { get; set; }
        public DbSet<AgentScheduleConfig> AgentScheduleConfigs { get; set; }



        // Landing Page DbSets 
        public DbSet<ThirdSection> ThirdSections { get; set; }
        public DbSet<ProcessStep> ProcessSteps { get; set; }
        public DbSet<FeatureItem> FeatureItems { get; set; }
        public DbSet<Partner> Partners { get; set; }
        public DbSet<AnnouncementConfig> Announcements { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<BaseMember>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<BaseMember>()
                .HasIndex(u => u.Username)
                .IsUnique();

            modelBuilder.Entity<BaseMember>()
                .HasOne(bm => bm.Agent)
                .WithOne(a => a.BaseMember)
                .HasForeignKey<Agent>(a => a.BaseMemberId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<BaseMember>()
                .HasOne(bm => bm.Client)
                .WithOne(c => c.BaseMember)
                .HasForeignKey<Client>(c => c.BaseMemberId)
                .OnDelete(DeleteBehavior.Cascade);

            // Chat configurations
            modelBuilder.Entity<ChatParticipant>()
                .HasIndex(cp => new { cp.ChatId, cp.BaseMemberId })
                .IsUnique();

            modelBuilder.Entity<MessageReaction>()
                .HasIndex(mr => new { mr.MessageId, mr.BaseMemberId, mr.Emoji })
                .IsUnique();

            modelBuilder.Entity<NotificationPreference>()
                .HasIndex(np => np.BaseMemberId)
                .IsUnique();

            modelBuilder.Entity<ChatParticipant>()
                .HasOne(cp => cp.Chat)
                .WithMany(c => c.Participants)
                .HasForeignKey(cp => cp.ChatId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ChatParticipant>()
                .HasOne(cp => cp.BaseMember)
                .WithMany()
                .HasForeignKey(cp => cp.BaseMemberId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Message>()
                .HasOne(m => m.Chat)
                .WithMany(c => c.Messages)
                .HasForeignKey(m => m.ChatId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Message>()
                .HasOne(m => m.Sender)
                .WithMany()
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MessageFile>()
                .HasOne(mf => mf.Message)
                .WithMany(m => m.MessageFiles)
                .HasForeignKey(mf => mf.MessageId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<MessageReaction>()
                .HasOne(mr => mr.Message)
                .WithMany(m => m.Reactions)
                .HasForeignKey(mr => mr.MessageId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MessageReaction>()
                .HasOne(mr => mr.BaseMember)
                .WithMany()
                .HasForeignKey(mr => mr.BaseMemberId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Notification>()
                .HasOne(n => n.BaseMember)
                .WithMany()
                .HasForeignKey(n => n.BaseMemberId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Notification>()
                .HasOne(n => n.Chat)
                .WithMany(c => c.Notifications)
                .HasForeignKey(n => n.ChatId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Notification>()
                .HasOne(n => n.Message)
                .WithMany(m => m.Notifications)
                .HasForeignKey(n => n.MessageId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<NotificationPreference>()
                .HasOne(np => np.BaseMember)
                .WithMany()
                .HasForeignKey(np => np.BaseMemberId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<OTPRecord>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
                entity.Property(e => e.OTPCode).IsRequired().HasMaxLength(10);
                entity.Property(e => e.ExpirationTime).IsRequired();
                entity.Property(e => e.CreatedAt).IsRequired();
                entity.HasIndex(e => new { e.Email, e.IsUsed, e.ExpirationTime });
                entity.HasIndex(e => e.CreatedAt);
            });
            modelBuilder.Entity<Partner>(entity =>
            {
                entity.HasKey(e => e.Id);
            });
            modelBuilder.Entity<AnnouncementConfig>(entity =>
            {
                entity.HasKey(e => e.Id);
            });
            modelBuilder.Entity<ThirdSection>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Title)
                    .IsRequired()
                    .HasMaxLength(200);

                entity.Property(e => e.Subtitle)
                    .HasMaxLength(300);

                entity.Property(e => e.Description)
                    .HasColumnType("nvarchar(max)");

                entity.Property(e => e.CreatedAt)
                    .IsRequired();

                entity.Property(e => e.UpdatedAt);

                // One-to-many relationship with ProcessSteps
                entity.HasMany(ts => ts.ProcessSteps)
                    .WithOne(ps => ps.ThirdSection)
                    .HasForeignKey(ps => ps.ThirdSectionId)
                    .OnDelete(DeleteBehavior.Cascade);

                // One-to-many relationship with FeatureItems
                entity.HasMany(ts => ts.FeatureItems)
                    .WithOne(fi => fi.ThirdSection)
                    .HasForeignKey(fi => fi.ThirdSectionId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Index for better performance
                entity.HasIndex(e => e.CreatedAt);
            });

            // ProcessStep configuration
            modelBuilder.Entity<ProcessStep>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.StepNumber)
                    .IsRequired();

                entity.Property(e => e.Title)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.Description)
                    .IsRequired()
                    .HasMaxLength(500);

                entity.Property(e => e.Icon)
                    .HasMaxLength(100);

                entity.Property(e => e.ThirdSectionId)
                    .IsRequired();

                entity.Property(e => e.CreatedAt)
                    .IsRequired();

                entity.Property(e => e.UpdatedAt);

                // Many-to-one relationship with ThirdSection
                entity.HasOne(ps => ps.ThirdSection)
                    .WithMany(ts => ts.ProcessSteps)
                    .HasForeignKey(ps => ps.ThirdSectionId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Index for better performance
                entity.HasIndex(e => new { e.ThirdSectionId, e.StepNumber });
                entity.HasIndex(e => e.StepNumber);
            });

            // FeatureItem configuration
            modelBuilder.Entity<FeatureItem>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Title)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.Description)
                    .IsRequired()
                    .HasMaxLength(500);

                entity.Property(e => e.Icon)
                    .HasMaxLength(100);

                entity.Property(e => e.ThirdSectionId)
                    .IsRequired();

                entity.Property(e => e.CreatedAt)
                    .IsRequired();

                entity.Property(e => e.UpdatedAt);

                // Many-to-one relationship with ThirdSection
                entity.HasOne(fi => fi.ThirdSection)
                    .WithMany(ts => ts.FeatureItems)
                    .HasForeignKey(fi => fi.ThirdSectionId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Index for better performance
                entity.HasIndex(e => e.ThirdSectionId);
            });

            modelBuilder.Entity<Rating>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.RatingNo).IsRequired();
                entity.Property(e => e.Stars).IsRequired();
                entity.Property(e => e.Comment).HasMaxLength(1000);
                entity.Property(e => e.RatingType).IsRequired().HasMaxLength(50);
                entity.Property(e => e.PropertyId).HasMaxLength(50);
                entity.Property(e => e.IsVisible).IsRequired();
                entity.Property(e => e.CreatedAt).IsRequired();
                entity.Property(e => e.UpdatedAt);

                entity.HasOne(r => r.Rater)
                    .WithMany()
                    .HasForeignKey(r => r.RaterId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(r => r.Rated)
                    .WithMany()
                    .HasForeignKey(r => r.RatedId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(r => r.Agent)
                    .WithMany(a => a.Ratings)
                    .HasForeignKey(r => r.AgentId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(r => r.Client)
                    .WithMany(c => c.Ratings)
                    .HasForeignKey(r => r.ClientId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(r => r.Chat)
                    .WithMany(c => c.Ratings)
                    .HasForeignKey(r => r.ChatId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => e.RatingNo).IsUnique();
            });

            modelBuilder.Entity<BaseMember>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Username).IsRequired().HasMaxLength(100);
                entity.Property(e => e.PasswordHash).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Role).IsRequired().HasMaxLength(20);
                entity.Property(e => e.status).IsRequired().HasMaxLength(20).HasDefaultValue("pending");
                entity.HasIndex(e => e.Email).IsUnique();
                entity.HasIndex(e => e.Username).IsUnique();
            });

            modelBuilder.Entity<Agent>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.FirstName)
                      .IsRequired()
                      .HasMaxLength(100);

                entity.Property(e => e.MiddleName)
                      .HasMaxLength(100);

                entity.Property(e => e.LastName)
                      .IsRequired()
                      .HasMaxLength(100);

                entity.Property(e => e.Suffix)
                      .HasMaxLength(10);

                entity.Property(e => e.CellPhoneNo)
                      .IsRequired()
                      .HasMaxLength(20);

                entity.Property(e => e.LicenseNumber)
                      .IsRequired()
                      .HasMaxLength(100);

                entity.Property(e => e.Bio)
                      .HasMaxLength(500);

                entity.Property(e => e.LicenseExpiry);

                entity.Property(e => e.Experience)
                      .HasMaxLength(500)
                      .HasDefaultValue(string.Empty);

                entity.Property(e => e.Specialization)
                      .HasMaxLength(1000)
                      .HasDefaultValue("[]");

                entity.Property(e => e.OfficeAddress)
                      .HasMaxLength(255);

                entity.Property(e => e.OfficePhone)
                      .HasMaxLength(50);

                entity.Property(e => e.Website)
                      .HasMaxLength(255);

                entity.Property(e => e.Languages)
                      .HasMaxLength(100);

                entity.Property(e => e.Education)
                      .HasMaxLength(500);

                entity.Property(e => e.Awards)
                      .HasMaxLength(500);

                entity.Property(e => e.YearsOfExperience);

                entity.Property(e => e.BrokerageName)
                      .HasMaxLength(100);

                entity.Property(e => e.IsVerified)
                      .HasDefaultValue(false);

                entity.Property(e => e.VerificationDate);

                entity.Property(e => e.DateRegistered)
                      .IsRequired();

                // One-to-one relationship with BaseMember
                entity.HasOne(a => a.BaseMember)
                      .WithOne(bm => bm.Agent)
                      .HasForeignKey<Agent>(a => a.BaseMemberId)
                      .OnDelete(DeleteBehavior.Cascade);

                // Index for better performance
                entity.HasIndex(e => e.LicenseNumber).IsUnique();
                entity.HasIndex(e => e.AgentNo).IsUnique();
                entity.HasIndex(e => e.IsVerified);
                entity.HasIndex(e => e.DateRegistered);
            });

            modelBuilder.Entity<Client>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.CellPhoneNo).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Country).HasMaxLength(100);
                entity.Property(e => e.City).HasMaxLength(100);
                entity.Property(e => e.Street).HasMaxLength(255);
                entity.Property(e => e.ZipCode).HasMaxLength(20);
                entity.Property(e => e.Address).HasMaxLength(255);

                // One-to-one relationship with BaseMember
                entity.HasOne(c => c.BaseMember)
                      .WithOne(bm => bm.Client)
                      .HasForeignKey<Client>(c => c.BaseMemberId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<PropertyHouse>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.PropertyNo).IsRequired();
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Description).IsRequired();
                entity.Property(e => e.Type).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Price).HasColumnType("decimal(12,2)");
                entity.Property(e => e.PropertyAge);
                entity.Property(e => e.PropertyFloor);
                entity.Property(e => e.Bedrooms);
                entity.Property(e => e.Bathrooms).HasColumnType("decimal(3,1)");
                entity.Property(e => e.Garage);
                entity.Property(e => e.Kitchen);
                entity.Property(e => e.AreaSqm);
                entity.Property(e => e.Address).IsRequired().HasMaxLength(255);
                entity.Property(e => e.City).IsRequired().HasMaxLength(100);
                entity.Property(e => e.State).IsRequired().HasMaxLength(100);
                entity.Property(e => e.ZipCode).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Latitude).HasColumnType("decimal(10,8)");
                entity.Property(e => e.Longitude).HasColumnType("decimal(11,8)");
                entity.Property(e => e.Status).IsRequired().HasMaxLength(20).HasDefaultValue("available");
                entity.Property(e => e.OwnerId).IsRequired(false);
                entity.Property(e => e.AgentId).IsRequired(false);
                entity.Property(e => e.CreatedAt).IsRequired();
                entity.Property(e => e.UpdatedAt).IsRequired();
                entity.Property(e => e.ListedDate).IsRequired();
                entity.Property(e => e.Amenities).IsRequired().HasDefaultValue("[]");

                // Relationships
                entity.HasOne(p => p.Owner)
                      .WithMany(c => c.Properties)
                      .HasForeignKey(p => p.OwnerId)
                      .OnDelete(DeleteBehavior.Restrict)
                      .IsRequired(false);

                entity.HasOne(p => p.Agent)
                      .WithMany(a => a.Properties)
                      .HasForeignKey(p => p.AgentId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<PropertyImage>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ImageUrl).IsRequired().HasMaxLength(500);

                // Relationship
                entity.HasOne(pi => pi.Property)
                      .WithMany(p => p.PropertyImages)
                      .HasForeignKey(pi => pi.PropertyId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<PropertyVideo>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.VideoUrl).IsRequired().HasMaxLength(500);
                entity.Property(e => e.CreatedAt).IsRequired();

                // Relationship
                entity.HasOne(pv => pv.Property)
                      .WithMany(p => p.PropertyVideos)
                      .HasForeignKey(pv => pv.PropertyId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Updated ScheduleProperties configuration
            modelBuilder.Entity<ScheduleProperties>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ScheduleNo).IsRequired();
                entity.Property(e => e.Status).IsRequired().HasMaxLength(20).HasDefaultValue("Scheduled");
                entity.Property(e => e.Notes).HasMaxLength(500);
                entity.Property(e => e.ScheduleTime).IsRequired();
                entity.Property(e => e.CreatedAt).IsRequired();
                entity.Property(e => e.UpdatedAt);

                // Property relationship
                entity.HasOne(sp => sp.Property)
                      .WithMany(p => p.ScheduleProperties)
                      .HasForeignKey(sp => sp.PropertyId)
                      .OnDelete(DeleteBehavior.Cascade);

                // FIXED: Agent relationship - using BaseMemberId as principal key
                entity.HasOne(sp => sp.Agent)
                      .WithMany(a => a.ScheduleProperties)
                      .HasForeignKey(sp => sp.AgentId)
                      .HasPrincipalKey(a => a.BaseMemberId)
                      .OnDelete(DeleteBehavior.Restrict);

                // FIXED: Client relationship - using BaseMemberId as principal key
                entity.HasOne(sp => sp.Client)
                      .WithMany(c => c.ScheduleProperties)
                      .HasForeignKey(sp => sp.ClientId)
                      .HasPrincipalKey(c => c.BaseMemberId)
                      .OnDelete(DeleteBehavior.Restrict);

                // Index for better performance
                entity.HasIndex(e => e.ScheduleNo).IsUnique();
                entity.HasIndex(e => e.Status);
            });
            modelBuilder.Entity<WishlistProperties>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Notes).HasMaxLength(500);
                entity.Property(e => e.AddedDate).IsRequired();

                entity.HasIndex(w => new { w.ClientId, w.PropertyId })
                      .IsUnique();

                // Relationships
                entity.HasOne(w => w.Client)
                      .WithMany(c => c.Wishlists)
                      .HasForeignKey(w => w.ClientId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(w => w.Property)
                      .WithMany(p => p.Wishlists)
                      .HasForeignKey(w => w.PropertyId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // AgentAvailability configuration
            modelBuilder.Entity<AgentAvailability>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.AgentId).IsRequired();
                entity.Property(e => e.DayOfWeek).IsRequired();
                entity.Property(e => e.StartTime).IsRequired();
                entity.Property(e => e.EndTime).IsRequired();
                entity.Property(e => e.IsAvailable).IsRequired().HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).IsRequired();
                entity.Property(e => e.UpdatedAt);

                // Relationship with Agent
                entity.HasOne(aa => aa.Agent)
                      .WithMany(a => a.AgentAvailabilities)
                      .HasForeignKey(aa => aa.AgentId)
                      .OnDelete(DeleteBehavior.Cascade);

                // Index for better performance
                entity.HasIndex(e => new { e.AgentId, e.DayOfWeek });
                entity.HasIndex(e => e.IsAvailable);
            });

            // AgentTimeOff configuration
            modelBuilder.Entity<AgentTimeOff>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.AgentId).IsRequired();
                entity.Property(e => e.StartDate).IsRequired();
                entity.Property(e => e.EndDate).IsRequired();
                entity.Property(e => e.Type).IsRequired().HasMaxLength(20).HasDefaultValue("Vacation");
                entity.Property(e => e.Reason).HasMaxLength(500);
                entity.Property(e => e.IsApproved).HasDefaultValue(false);
                entity.Property(e => e.IsAllDay).HasDefaultValue(true); // ✅ Fixed: Added missing field
                entity.Property(e => e.CreatedAt).IsRequired();
                entity.Property(e => e.UpdatedAt);

                // Relationship with Agent
                entity.HasOne(ato => ato.Agent)
                      .WithMany(a => a.AgentTimeOffs)
                      .HasForeignKey(ato => ato.AgentId)
                      .OnDelete(DeleteBehavior.Cascade);

                // Index for better performance
                entity.HasIndex(e => new { e.AgentId, e.StartDate, e.EndDate });
                entity.HasIndex(e => e.IsApproved);
            });

    
            modelBuilder.Entity<AgentScheduleConfig>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.AgentId).IsRequired();
                entity.Property(e => e.WorkDayStart).IsRequired().HasDefaultValue(new TimeSpan(9, 0, 0));
                entity.Property(e => e.WorkDayEnd).IsRequired().HasDefaultValue(new TimeSpan(17, 0, 0));
                entity.Property(e => e.SlotDurationMinutes).IsRequired().HasDefaultValue(60);
                entity.Property(e => e.BufferTimeMinutes).IsRequired().HasDefaultValue(15);
                entity.Property(e => e.MaxSchedulesPerDay).IsRequired().HasDefaultValue(8); 
                entity.Property(e => e.AllowWeekendScheduling).IsRequired().HasDefaultValue(false); 
                entity.Property(e => e.AdvanceBookingDays).IsRequired().HasDefaultValue(30);
                entity.Property(e => e.CreatedAt).IsRequired();
                entity.Property(e => e.UpdatedAt);
                entity.HasOne(asc => asc.Agent)
                      .WithOne(a => a.AgentScheduleConfig)
                      .HasForeignKey<AgentScheduleConfig>(asc => asc.AgentId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.AgentId).IsUnique();
            });
        }
    }
}