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

public record LoginCommand(LoginRequestDto Dto) : IRequest<(TokenResponseDto Response, string RefreshToken, DateTime RefreshTokenExpiration)>;

public class LoginCommandHandler : IRequestHandler<LoginCommand, (TokenResponseDto Response, string RefreshToken, DateTime RefreshTokenExpiration)>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITokenService _tokenService;
    private readonly IConfiguration _configuration;

    public LoginCommandHandler(IUnitOfWork unitOfWork, ITokenService tokenService, IConfiguration configuration)
    {
        _unitOfWork = unitOfWork;
        _tokenService = tokenService;
        _configuration = configuration;
    }

    public async Task<(TokenResponseDto Response, string RefreshToken, DateTime RefreshTokenExpiration)> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var adminRepository = _unitOfWork.Repository<Admin>();
        var admins = await adminRepository.FindAsync(a => a.Username == request.Dto.Username);
        var admin = admins.FirstOrDefault();

        if (admin == null || !BCrypt.Net.BCrypt.Verify(request.Dto.Password, admin.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid credentials.");
        }

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, admin.Id.ToString()),
            new Claim(ClaimTypes.Role, "Admin")
        };

        var accessToken = _tokenService.GenerateAccessToken(claims);
        var refreshToken = _tokenService.GenerateRefreshToken();
        var refreshTokenExpiration = DateTime.UtcNow.AddDays(double.Parse(_configuration["JwtSettings:RefreshTokenExpirationDays"]!));

        admin.UpdateRefreshToken(refreshToken, refreshTokenExpiration);
        adminRepository.Update(admin);
        await _unitOfWork.CompleteAsync(cancellationToken);

        return (new TokenResponseDto(accessToken), refreshToken, refreshTokenExpiration);
    }
}