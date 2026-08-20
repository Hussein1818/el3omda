using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Core.Application.Contracts;
using Core.Application.DTOs.Bookings;
using Core.Domain.Entities;
using MediatR;

namespace Core.Application.Features.Bookings.Queries;

public record GetAllBookingsQuery(int PageNumber = 1, int PageSize = 10) : IRequest<IReadOnlyList<BookingResponseDto>>;

public class GetAllBookingsQueryHandler : IRequestHandler<GetAllBookingsQuery, IReadOnlyList<BookingResponseDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetAllBookingsQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<BookingResponseDto>> Handle(GetAllBookingsQuery request, CancellationToken cancellationToken)
    {
        var repository = _unitOfWork.Repository<Booking>();

        var bookings = await repository.FindAsync(b => true, "Book");

        return bookings
            .OrderBy(b => b.Book?.Stage)
            .ThenBy(b => b.Book?.Subject)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(b => new BookingResponseDto(
                b.Id,
                b.StudentName,
                b.Book?.Name ?? "Unknown Book",
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