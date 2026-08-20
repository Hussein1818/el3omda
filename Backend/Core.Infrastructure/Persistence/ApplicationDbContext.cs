using Core.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace Core.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Admin> Admins { get; set; }
    public DbSet<Book> Books { get; set; }
    public DbSet<Booking> Bookings { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        base.OnModelCreating(modelBuilder);
    }
}