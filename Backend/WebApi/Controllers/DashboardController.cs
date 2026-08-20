using System.Threading.Tasks;
using Core.Application.Features.Dashboard.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly IMediator _mediator;

    public DashboardController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("print-statistics")]
    public async Task<IActionResult> GetPrintStatistics()
    {
        var query = new GetPrintStatisticsQuery();
        var result = await _mediator.Send(query);

        return Ok(result);
    }
    [HttpPost("print-next")]
    public async Task<IActionResult> PrintNext([FromBody] Core.Application.DTOs.Dashboard.PrintNextRequestDto request)
    {
        var command = new Core.Application.Features.Dashboard.Commands.PrintNextBookingCommand(request);
        await _mediator.Send(command);
        return NoContent();
    }
}