using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Core.Application.Contracts;
using Core.Application.DTOs.Bookings;
using Core.Domain.Entities;
using MediatR;

namespace Core.Application.Features.Bookings.Queries;

public record SearchBookingsQuery(string SearchTerm) : IRequest<IReadOnlyList<BookingResponseDto>>;

public class SearchBookingsQueryHandler : IRequestHandler<SearchBookingsQuery, IReadOnlyList<BookingResponseDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public SearchBookingsQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<BookingResponseDto>> Handle(SearchBookingsQuery request, CancellationToken cancellationToken)
    {
        var repository = _unitOfWork.Repository<Booking>();

        var bookings = await repository.FindAsync(
            b => string.IsNullOrEmpty(request.SearchTerm) || b.StudentName.Contains(request.SearchTerm) || b.Book.Name.Contains(request.SearchTerm),
            "Book"
        );

        return bookings
            .OrderBy(b => b.Book.Stage)
            .ThenBy(b => b.Book.Subject)
            .Select(b => new BookingResponseDto(
                b.Id,
                b.StudentName,
                b.Book?.Name ?? "Unknown",
                b.Book?.Subject ?? "Unknown",
                b.Book?.Stage ?? default,
                b.Book?.Year ?? default,
                b.PrintFormat,
                b.PaidAmount,
                b.RemainingAmount,
                b.IsPrinted,
                b.IsDelivered,
                b.CreatedAt,
                b.DeliveryDate
            )).ToList();
    }
}