using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using Core.Application.Contracts;
using Core.Application.DTOs.Bookings;
using Core.Application.DTOs.Common;
using Core.Domain.Entities;
using MediatR;

namespace Core.Application.Features.Bookings.Queries;

public record GetAllBookingsQuery(string? SearchTerm, int PageNumber, int PageSize) : IRequest<PaginatedResponseDto<BookingResponseDto>>;

public class GetAllBookingsQueryHandler : IRequestHandler<GetAllBookingsQuery, PaginatedResponseDto<BookingResponseDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetAllBookingsQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PaginatedResponseDto<BookingResponseDto>> Handle(GetAllBookingsQuery request, CancellationToken cancellationToken)
    {
        var bookingRepository = _unitOfWork.Repository<Booking>();
        var bookRepository = _unitOfWork.Repository<Book>();

        Expression<Func<Booking, bool>>? predicate = null;

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            predicate = b => b.StudentName.Contains(request.SearchTerm);
        }

        var (items, totalCount) = await bookingRepository.GetPagedAsync(request.PageNumber, request.PageSize, predicate);
        var books = await bookRepository.GetAllAsync();

        var mappedItems = items.Select(b => new BookingResponseDto(
            b.Id,
            b.StudentName,
            books.FirstOrDefault(x => x.Id == b.BookId)?.Name ?? "Unknown Book",
            b.PrintFormat,
            b.PaidAmount,
            b.RemainingAmount,
            b.IsDelivered,
            b.CreatedAt,
            b.DeliveryDate
        )).ToList();

        return new PaginatedResponseDto<BookingResponseDto>(mappedItems, totalCount, request.PageNumber, request.PageSize);
    }
}