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
            b => b.StudentName.Contains(request.SearchTerm) || b.Book.Name.Contains(request.SearchTerm),
            "Book"
        );

        return bookings.Select(b => new BookingResponseDto(
            b.Id,
            b.StudentName,
            b.Book?.Name ?? "Unknown Book",
            b.PrintFormat,
            b.PaidAmount,
            b.RemainingAmount,
            b.IsDelivered,
            b.CreatedAt,
            b.DeliveryDate
        )).ToList();
    }
}