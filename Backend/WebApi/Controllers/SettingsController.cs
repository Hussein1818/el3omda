using System.Security.Claims;
using System.Threading.Tasks;
using Core.Application.DTOs.Settings;
using Core.Application.Features.Settings.Commands;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class SettingsController : ControllerBase
{
    private readonly IMediator _mediator;

    public SettingsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequestDto request)
    {
        var username = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.Identity?.Name ?? "admin";

        var command = new ChangePasswordCommand(request, username);
        await _mediator.Send(command);

        return NoContent();
    }
}