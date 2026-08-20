using System;
using System.Threading.Tasks;
using Core.Application.DTOs.Auth;
using Core.Application.Features.Auth.Commands;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        try
        {
            var command = new LoginCommand(request);
            var result = await _mediator.Send(command);

            SetRefreshTokenCookie(result.RefreshToken, result.RefreshTokenExpiration);

            return Ok(result.Response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshToken()
    {
        var refreshToken = Request.Cookies["refreshToken"];

        if (string.IsNullOrEmpty(refreshToken))
        {
            return Unauthorized(new { message = "Refresh token is missing." });
        }

        try
        {
            var command = new RefreshTokenCommand(refreshToken);
            var result = await _mediator.Send(command);

            SetRefreshTokenCookie(result.NewRefreshToken, result.NewRefreshTokenExpiration);

            return Ok(result.Response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var refreshToken = Request.Cookies["refreshToken"];

        if (!string.IsNullOrEmpty(refreshToken))
        {
            var command = new RevokeTokenCommand(refreshToken);
            await _mediator.Send(command);
        }

        Response.Cookies.Delete("refreshToken");

        return NoContent();
    }

    private void SetRefreshTokenCookie(string token, DateTime expiration)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = expiration
        };

        Response.Cookies.Append("refreshToken", token, cookieOptions);
    }
}