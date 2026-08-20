using System;
using Core.Domain.Common;

namespace Core.Domain.Entities;

public class Admin : BaseEntity
{
    public string? Username { get; private set; }
    public string? PasswordHash { get; private set; }
    public string? RefreshToken { get; private set; }
    public DateTime? RefreshTokenExpiryTime { get; private set; }

    private Admin() { }

    public Admin(string username, string passwordHash)
    {
        Username = username;
        PasswordHash = passwordHash;
    }

    public void UpdateRefreshToken(string refreshToken, DateTime expiryTime)
    {
        RefreshToken = refreshToken;
        RefreshTokenExpiryTime = expiryTime;
        UpdateTimestamp();
    }

    public void UpdatePassword(string newPasswordHash)
    {
        PasswordHash = newPasswordHash;
        UpdateTimestamp();
    }
}