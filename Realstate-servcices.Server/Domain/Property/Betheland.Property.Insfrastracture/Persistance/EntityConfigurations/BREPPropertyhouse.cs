//using Microsoft.EntityFrameworkCore;
//using Microsoft.EntityFrameworkCore.ChangeTracking;
//using Microsoft.EntityFrameworkCore.Metadata.Builders;
//using Realstate_servcices.Server.Entity.Properties;
//using System.Reflection.Emit;

//namespace Realstate_servcices.Server.Domain.Property.Betheland.Property.Insfrastracture.Persistance.EntityConfigurations
//{
//    public class BREPPropertyhouse : IEntityTypeConfiguration<PropertyHouse>   
//    {
//        public void Configure(EntityTypeBuilder<PropertyHouse> builder)
//        {
//            // PropertyHouse configuration
//            builder.ToTable("Property");
//            builder.HasKey(x => x.Id);
//            builder.Property(x => x.PropertyNo)
//                   .IsRequired()
//                    .HasDefaultValueSql("NEWID()");
//            builder.Property(x => x.Title)
//                    .IsRequired()
//                    .HasMaxLength(200);
//            builder.Property(x => x.Description)
//                    .IsRequired()
//                    .HasMaxLength(1000);
    
//            builder.Property(x => x.Type)
//                    .HasMaxLength(50);
    
//            builder.Property(x => x.Price)
//                    .IsRequired()
//                    .HasColumnType("decimal(18,2)");
    
//            builder.Property(x => x.PropertyAge)
//                    .IsRequired();
    
//            builder.Property(x => x.PropertyFloor)
//                    .IsRequired();
    
//            builder.Property(x => x.Bedrooms)
//                    .IsRequired();
    
//            builder.Property(x => x.Bathrooms)
//                    .IsRequired()
//                    .HasColumnType("decimal(4,2)");
    
//            builder.Property(x => x.Garage)
//                    .IsRequired();
    
//            builder.Property(x => x.Kitchen)
//                    .IsRequired();
    
//            builder.Property(x => x.AreaSqm)
//                    .IsRequired();
    
//            builder.Property(x => x.Country)
//                    .IsRequired()
//                    .HasMaxLength(100);
    
//            builder.Property(x => x.Address)
//                    .IsRequired()
//                    .HasMaxLength(200);
    
//            builder.Property(x => x.City)
//                    .IsRequired()
//                    .HasMaxLength(100);
    
//            builder.Property(x => x.Barangay)
//                    .IsRequired()
//                    .HasMaxLength(100);
    
//            builder.Property(x => x.State)
//                    .IsRequired()
//                    .HasMaxLength(100);
    
//            builder.Property(x => x.ZipCode)
//                    .IsRequired()
//                    .HasMaxLength(20);
    
//           builder.Property(x => x.Latitude)
//                    .HasColumnType("decimal(10,8)");
    
//           builder.Property(x => x.Longitude)
//                    .HasColumnType("decimal(11,8)");
    
//           builder.Property(x => x.Status)
//                    .IsRequired()
//                    .HasMaxLength(50);  

//        }
//    }
//}
