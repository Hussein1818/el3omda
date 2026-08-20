using Core.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Core.Infrastructure.Persistence.Configurations;

public class BookingConfiguration : IEntityTypeConfiguration<Booking>
{
    public void Configure(EntityTypeBuilder<Booking> builder)
    {
        builder.HasKey(b => b.Id);

        builder.Property(b => b.StudentName)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(b => b.PaidAmount)
            .HasColumnType("decimal(18,2)");

        builder.Property(b => b.RemainingAmount)
            .HasColumnType("decimal(18,2)");

        builder.HasOne(b => b.Book)
            .WithMany()
            .HasForeignKey(b => b.BookId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}