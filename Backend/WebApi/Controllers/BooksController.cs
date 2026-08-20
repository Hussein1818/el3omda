using System;
using System.Threading.Tasks;
using Core.Application.DTOs.Books;
using Core.Application.Features.Books.Commands;
using Core.Application.Features.Books.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    private readonly IMediator _mediator;

    public BooksController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllBooks()
    {
        var query = new GetAllBooksQuery();
        var result = await _mediator.Send(query);

        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateBook([FromBody] CreateBookRequestDto request)
    {
        var command = new CreateBookCommand(request);
        var result = await _mediator.Send(command);

        return CreatedAtAction(nameof(GetAllBooks), new { id = result }, new { BookId = result });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBook(Guid id, [FromBody] UpdateBookRequestDto request)
    {
        var command = new UpdateBookCommand(id, request);
        await _mediator.Send(command);

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBook(Guid id)
    {
        var command = new DeleteBookCommand(id);
        await _mediator.Send(command);

        return NoContent();
    }
    [HttpGet("printed-inventory")]
    public async Task<IActionResult> GetPrintedInventory()
    {
        var query = new GetPrintedInventoryQuery();
        var result = await _mediator.Send(query);
        return Ok(result);
    }
    [HttpPost("adjust-inventory")]
    public async Task<IActionResult> AdjustInventory([FromBody] AdjustInventoryRequestDto request)
    {
        var command = new AdjustInventoryStockCommand(request);
        await _mediator.Send(command);

        return NoContent();
    }
}