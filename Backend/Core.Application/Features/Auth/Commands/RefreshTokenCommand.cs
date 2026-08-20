using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using System.Threading;
using System.Threading.Tasks;
using Core.Application.Contracts;
using Core.Application.DTOs.Auth;
using Core.Domain.Entities;
using MediatR;
using Microsoft.Extensions.Configuration;

namespace Core.Application.Features.Auth.Commands;

public record RefreshTokenCommand(string RefreshToken) : IRequest<(TokenResponseDto Response, string NewRefreshToken, DateTime NewRefreshTokenExpiration)>;

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, (TokenResponseDto Response, string NewRefreshToken, DateTime NewRefreshTokenExpiration)>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITokenService _tokenService;
    private readonly IConfiguration _configuration;

    public RefreshTokenCommandHandler(IUnitOfWork unitOfWork, ITokenService tokenService, IConfiguration configuration)
    {
        _unitOfWork = unitOfWork;
        _tokenService = tokenService;
        _configuration = configuration;
    }

    public async Task<(TokenResponseDto Response, string NewRefreshToken, DateTime NewRefreshTokenExpiration)> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var adminRepository = _unitOfWork.Repository<Admin>();
        var admins = await adminRepository.FindAsync(a => a.RefreshToken == request.RefreshToken);
        var admin = admins.FirstOrDefault();

        if (admin == null || admin.RefreshTokenExpiryTime <= DateTime.UtcNow)
        {
            throw new UnauthorizedAccessException("Invalid or expired refresh token.");
        }

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, admin.Id.ToString()),
            new Claim(ClaimTypes.Role, "Admin")
        };

        var accessToken = _tokenService.GenerateAccessToken(claims);
        var newRefreshToken = _tokenService.GenerateRefreshToken();
        var newRefreshTokenExpiration = DateTime.UtcNow.AddDays(double.Parse(_configuration["JwtSettings:RefreshTokenExpirationDays"]!));

        admin.UpdateRefreshToken(newRefreshToken, newRefreshTokenExpiration);
        adminRepository.Update(admin);
        await _unitOfWork.CompleteAsync(cancellationToken);

        return (new TokenResponseDto(accessToken), newRefreshToken, newRefreshTokenExpiration);
    }
}