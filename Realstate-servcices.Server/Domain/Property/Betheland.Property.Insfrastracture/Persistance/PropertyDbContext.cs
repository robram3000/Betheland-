//using Microsoft.EntityFrameworkCore;
//using Realstate_servcices.Server.Domain.Property.Betheland.Property.Insfrastracture.Persistance.EntityConfigurations;
//using Realstate_servcices.Server.Entity.Properties;

//namespace Realstate_servcices.Server.Domain.Property.Betheland.Property.Insfrastracture.Persistance
//{
//    public class PropertyDbContext : DbContext
//    {
//        public DbSet<PropertyHouse> Properties { get; set; }
//        public DbSet<PropertyImage> PropertyImages { get; set; }
//        public DbSet<PropertyVideo> PropertyVideos { get; set; }


//        protected override void OnModelCreating(ModelBuilder modelBuilder)
//        {
//           modelBuilder.ApplyConfiguration(new BREPPropertyhouse());   
//           modelBuilder.ApplyConfiguration(new BREPPropertyImage());

//           base.OnModelCreating(modelBuilder);  

//        }   

//        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
//        {
//            var entries = ChangeTracker.Entries()
//                .Where(e => e.Entity is PropertyHouse && (e.State == EntityState.Added || e.State == EntityState.Modified));
//            foreach (var entry in entries)
//            {
//                if (entry.Entity is PropertyHouse property)
//                {
//                    property.UpdatedAt = DateTime.UtcNow;
//                    if (entry.State == EntityState.Added)
//                    {
//                        property.CreatedAt = DateTime.UtcNow;
//                    }
//                }
//            }
//            return base.SaveChangesAsync(cancellationToken);
//        }
//    }
//}
