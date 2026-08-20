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
        var bookRepository = _unitOfWork.Repository<Book>();

        var pendingBookings = await bookingRepository.FindAsync(b => !b.IsDelivered);
        var books = await bookRepository.GetAllAsync();

        var statistics = pendingBookings
            .GroupBy(b => new { b.BookId, b.PrintFormat })
            .Select(g =>
            {
                var book = books.FirstOrDefault(x => x.Id == g.Key.BookId);
                return new BookPrintSummaryDto(
                     g.Key.BookId,
                     book?.Name ?? "Unknown Book",
                     book?.Subject ?? "Unknown",
                     book?.Stage ?? default,
                     book?.Year ?? default,
                     g.Key.PrintFormat,
                     g.Count()
                 );
            })
            .OrderBy(x => x.Stage)
            .ThenBy(x => x.Year)
            .ToList();

        return statistics;
    }
}