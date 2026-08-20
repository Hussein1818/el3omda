using Core.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Core.Infrastructure.Persistence.Configurations;

public class BookConfiguration : IEntityTypeConfiguration<Book>
{
    public void Configure(EntityTypeBuilder<Book> builder)
    {
        builder.HasKey(b => b.Id);

        builder.Property(b => b.Name)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(b => b.Subject)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(b => b.PortraitPrice)
            .HasColumnType("decimal(18,2)");

        builder.Property(b => b.LandscapePrice)
            .HasColumnType("decimal(18,2)");
        builder.Property(b => b.PortraitStock)
            .HasDefaultValue(0);
        builder.Property(b => b.LandscapeStock)
            .HasDefaultValue(0);
    }
}