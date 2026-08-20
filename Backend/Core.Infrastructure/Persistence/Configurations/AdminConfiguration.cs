using Core.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Core.Infrastructure.Persistence.Configurations;

public class AdminConfiguration : IEntityTypeConfiguration<Admin>
{
    public void Configure(EntityTypeBuilder<Admin> builder)
    {
        builder.HasKey(a => a.Id);

        builder.Property(a => a.Username)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(a => a.Username).IsUnique();

        builder.Property(a => a.PasswordHash)
            .IsRequired();
    }
}