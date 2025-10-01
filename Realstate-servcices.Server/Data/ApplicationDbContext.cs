using Microsoft.EntityFrameworkCore;
using Realstate_servcices.Server.Entity.Member;
using Realstate_servcices.Server.Entity.member;
using Realstate_servcices.Server.Entity.Property;
using Realstate_servcices.Server.Entity.OTP;

namespace Realstate_servcices.Server.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        // Member entities
        public DbSet<BaseMember> BaseMembers { get; set; }
        public DbSet<Agent> Agents { get; set; }
        public DbSet<Client> Clients { get; set; }

        public DbSet<Property> Properties { get; set; }
        public DbSet<PropertyImage> PropertyImages { get; set; }
        public DbSet<ScheduleProperties> ScheduleProperties { get; set; }
        public DbSet<Wishlist> Wishlists { get; set; } 

        public DbSet<OTPRecord> OTPRecords { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

        
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
                entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.CellPhoneNo).IsRequired().HasMaxLength(20);
                entity.Property(e => e.LicenseNumber).IsRequired().HasMaxLength(100);

                // One-to-one relationship with BaseMember
                entity.HasOne(a => a.BaseMember)
                      .WithOne(bm => bm.Agent)
                      .HasForeignKey<Agent>(a => a.BaseMemberId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

       
            modelBuilder.Entity<Client>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.CellPhoneNo).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Country).IsRequired().HasMaxLength(100);
                entity.Property(e => e.City).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Street).IsRequired().HasMaxLength(255);
                entity.Property(e => e.ZipCode).IsRequired().HasMaxLength(20);

                // One-to-one relationship with BaseMember
                entity.HasOne(c => c.BaseMember)
                      .WithOne(bm => bm.Client)
                      .HasForeignKey<Client>(c => c.BaseMemberId)
                      .OnDelete(DeleteBehavior.Cascade);
            });


            modelBuilder.Entity<Property>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Type).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Price).HasColumnType("decimal(12,2)");
                entity.Property(e => e.Bathrooms).HasColumnType("decimal(3,1)");
                entity.Property(e => e.Address).IsRequired().HasMaxLength(255);
                entity.Property(e => e.City).IsRequired().HasMaxLength(100);
                entity.Property(e => e.State).IsRequired().HasMaxLength(100);
                entity.Property(e => e.ZipCode).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Latitude).HasColumnType("decimal(10,8)");
                entity.Property(e => e.Longitude).HasColumnType("decimal(11,8)");
                entity.Property(e => e.Status).IsRequired().HasMaxLength(20).HasDefaultValue("available");

                // Add this line for Amenities
                entity.Property(e => e.Amenities).IsRequired().HasDefaultValue("[]");

                // Relationships
                entity.HasOne(p => p.Owner)
                      .WithMany(c => c.Properties)
                      .HasForeignKey(p => p.OwnerId)
                      .OnDelete(DeleteBehavior.Restrict);

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

        
            modelBuilder.Entity<ScheduleProperties>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Status).IsRequired().HasMaxLength(20).HasDefaultValue("Scheduled");
                entity.Property(e => e.Notes).HasMaxLength(500);
                entity.Property(e => e.ScheduleTime).IsRequired();

                // Relationships
                entity.HasOne(sp => sp.Property)
                      .WithMany(p => p.ScheduleProperties)
                      .HasForeignKey(sp => sp.PropertyId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(sp => sp.Agent)
                      .WithMany(a => a.ScheduleProperties)
                      .HasForeignKey(sp => sp.AgentId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(sp => sp.Client)
                      .WithMany(c => c.ScheduleProperties)
                      .HasForeignKey(sp => sp.ClientId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

       
            modelBuilder.Entity<Wishlist>(entity =>
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
        }
    }
}