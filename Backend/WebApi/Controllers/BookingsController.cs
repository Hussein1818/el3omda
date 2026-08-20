using System;
using System.Threading.Tasks;
using Core.Application.DTOs.Bookings;
using Core.Application.Features.Bookings.Commands;
using Core.Application.Features.Bookings.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly IMediator _mediator;

    public BookingsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingRequestDto request)
    {
        var command = new CreateBookingCommand(request);
        var result = await _mediator.Send(command);

        return CreatedAtAction(nameof(GetBookings), new { id = result }, new { BookingId = result });
    }

    [HttpGet]
    public async Task<IActionResult> GetBookings([FromQuery] string? searchTerm)
    {
        var query = new SearchBookingsQuery(searchTerm ?? string.Empty);
        var result = await _mediator.Send(query);

        return Ok(result);
    }

    [HttpPatch("{id}/deliver")]
    public async Task<IActionResult> MarkAsDelivered(Guid id)
    {
        var command = new MarkBookingAsDeliveredCommand(id);
        await _mediator.Send(command);

        return NoContent();
    }

    [HttpPatch("{id}/print")]
    public async Task<IActionResult> MarkAsPrinted(Guid id)
    {
        var command = new MarkBookingAsPrintedCommand(id);
        await _mediator.Send(command);

        return NoContent();
    }

    [HttpPatch("{id}/payment")]
    public async Task<IActionResult> UpdatePayment(Guid id, [FromBody] UpdatePaymentRequestDto request)
    {
        var command = new UpdatePaymentCommand(id, request);
        await _mediator.Send(command);

        return NoContent();
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBooking(Guid id, [FromBody] UpdateBookingRequestDto request)
    {
        var command = new UpdateBookingCommand(id, request);
        await _mediator.Send(command);

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBooking(Guid id)
    {
        var command = new DeleteBookingCommand(id);
        await _mediator.Send(command);

        return NoContent();
    }
    [HttpPatch("{id}/undo-print")]
    public async Task<IActionResult> UndoPrint(Guid id)
    {
        var command = new UndoBookingPrintCommand(id);
        await _mediator.Send(command);
        return NoContent();
    }
}