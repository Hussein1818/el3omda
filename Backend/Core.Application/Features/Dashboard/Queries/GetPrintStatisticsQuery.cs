using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Core.Application.Contracts;
using Core.Application.DTOs.Dashboard;
using Core.Domain.Entities;
using MediatR;

namespace Core.Application.Features.Dashboard.Queries;

public record GetPrintStatisticsQuery() : IRequest<IReadOnlyList<BookPrintSummaryDto>>;

public class GetPrintStatisticsQueryHandler : IRequestHandler<GetPrintStatisticsQuery, IReadOnlyList<BookPrintSummaryDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetPrintStatisticsQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<BookPrintSummaryDto>> Handle(GetPrintStatisticsQuery request, CancellationToken cancellationToken)
    {
        var bookingRepository = _unitOfWork.Repository<Booking>();

        var pendingBookings = await bookingRepository.FindAsync(b => !b.IsPrinted && !b.IsDelivered, "Book");

        return pendingBookings
            .Where(b => b.Book != null)
            .GroupBy(b => new { b.BookId, b.Book.Name, b.Book.Subject, b.Book.Stage, b.Book.Year, b.PrintFormat })
            .Select(g => new BookPrintSummaryDto(
                g.Key.BookId,
                g.Key.Name,
                g.Key.Subject,
                g.Key.Stage,
                g.Key.Year,
                g.Key.PrintFormat,
                g.Count()
            ))
            .OrderByDescending(s => s.TotalToPrint)
            .ToList();
    }
}