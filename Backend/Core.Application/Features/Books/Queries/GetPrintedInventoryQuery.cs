using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Core.Application.Contracts;
using Core.Application.DTOs.Books;
using Core.Domain.Entities;
using Core.Domain.Enums;
using MediatR;

namespace Core.Application.Features.Books.Queries;

public record GetPrintedInventoryQuery() : IRequest<IReadOnlyList<PrintedBookDto>>;

public class GetPrintedInventoryQueryHandler : IRequestHandler<GetPrintedInventoryQuery, IReadOnlyList<PrintedBookDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetPrintedInventoryQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<PrintedBookDto>> Handle(GetPrintedInventoryQuery request, CancellationToken cancellationToken)
    {
        var bookRepository = _unitOfWork.Repository<Book>();
        var bookingRepository = _unitOfWork.Repository<Booking>();

        var books = await bookRepository.FindAsync(b => b.PortraitStock > 0 || b.LandscapeStock > 0);

        var activeBookings = await bookingRepository.FindAsync(b => b.IsPrinted && !b.IsDelivered);

        var reservedGroups = activeBookings
            .GroupBy(b => new { b.BookId, b.PrintFormat })
            .ToDictionary(g => g.Key, g => g.Count());

        return books
            .OrderBy(b => b.Stage).ThenBy(b => b.Subject)
            .Select(b =>
            {
                int reservedPortrait = reservedGroups.GetValueOrDefault(new { BookId = b.Id, PrintFormat = PrintFormat.Portrait }, 0);
                int reservedLandscape = reservedGroups.GetValueOrDefault(new { BookId = b.Id, PrintFormat = PrintFormat.Landscape }, 0);

                return new PrintedBookDto(
                    b.Id,
                    b.Name,
                    b.Subject,
                    b.Stage,
                    b.Year,
                    b.PortraitStock,
                    reservedPortrait,
                    b.PortraitStock - reservedPortrait,
                    b.LandscapeStock,
                    reservedLandscape,
                    b.LandscapeStock - reservedLandscape
                );
            })
            .ToList();
    }
}