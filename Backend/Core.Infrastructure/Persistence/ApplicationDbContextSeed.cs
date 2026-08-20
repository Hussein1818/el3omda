using System.Linq;
using System.Threading.Tasks;
using Core.Domain.Entities;
using Microsoft.Extensions.Configuration;

namespace Core.Infrastructure.Persistence;

public static class ApplicationDbContextSeed
{
    public static async Task SeedAdminAsync(ApplicationDbContext context, IConfiguration configuration)
    {
        if (!context.Admins.Any())
        {
            var adminSettings = configuration.GetSection("AdminSettings");
            var username = adminSettings["Username"];
            var password = adminSettings["Password"];

            if (!string.IsNullOrEmpty(username) && !string.IsNullOrEmpty(password))
            {
                var passwordHash = BCrypt.Net.BCrypt.HashPassword(password);
                var admin = new Admin(username, passwordHash);

                context.Admins.Add(admin);
                await context.SaveChangesAsync();
            }
        }
    }
}