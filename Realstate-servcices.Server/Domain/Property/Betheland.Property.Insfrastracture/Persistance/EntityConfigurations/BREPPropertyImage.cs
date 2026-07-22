//using Microsoft.EntityFrameworkCore;
//using Realstate_servcices.Server.Entity.Properties;

//namespace Realstate_servcices.Server.Domain.Property.Betheland.Property.Insfrastracture.Persistance.EntityConfigurations
//{
//    public class BREPPropertyImage : IEntityTypeConfiguration<PropertyImage>    
//    {
//        public void Configure(Microsoft.EntityFrameworkCore.Metadata.Builders.EntityTypeBuilder<PropertyImage> builder)
//        {
//            builder.ToTable("PropertyImage");

//            builder.HasKey(pi => pi.Id);
//            builder.Property(pi => pi.ImageUrl).IsRequired().HasMaxLength(500);
//            builder.Property(pi => pi.CreatedAt).HasDefaultValueSql("GETDATE()");
//            builder.HasOne(pi => pi.Property)
//                   .WithMany(p => p.PropertyImages)
//                   .HasForeignKey(pi => pi.PropertyId)
//                   .OnDelete(DeleteBehavior.Cascade);
//        }   


//    }
//}
