using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Core.Application.Contracts;
using Core.Application.DTOs.Bookings;
using Core.Domain.Entities;
using Core.Domain.Enums;
using MediatR;

namespace Core.Application.Features.Bookings.Commands;

public record UpdateBookingCommand(Guid BookingId, UpdateBookingRequestDto Dto) : IRequest<bool>;

public class UpdateBookingCommandHandler : IRequestHandler<UpdateBookingCommand, bool>
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdateBookingCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(UpdateBookingCommand request, CancellationToken cancellationToken)
    {
        var bookingRepository = _unitOfWork.Repository<Booking>();
        var booking = await bookingRepository.GetByIdAsync(request.BookingId);

        if (booking == null)
        {
            throw new KeyNotFoundException($"Booking with ID {request.BookingId} was not found.");
        }

        var bookRepository = _unitOfWork.Repository<Book>();
        var book = await bookRepository.GetByIdAsync(request.Dto.BookId);

        if (book == null)
        {
            throw new KeyNotFoundException($"Book with ID {request.Dto.BookId} was not found.");
        }

        decimal requiredPrice = request.Dto.PrintFormat == PrintFormat.Portrait
            ? book.PortraitPrice
            : book.LandscapePrice;

        if (request.Dto.PaidAmount > requiredPrice)
        {
            throw new InvalidOperationException("Paid amount exceeds the actual format price.");
        }

        decimal recalculatedRemaining = requiredPrice - request.Dto.PaidAmount;

        booking.UpdateDetails(
            request.Dto.StudentName,
            request.Dto.BookId,
            request.Dto.PrintFormat,
            request.Dto.PaidAmount,
            recalculatedRemaining
        );

        bookingRepository.Update(booking);
        await _unitOfWork.CompleteAsync(cancellationToken);

        return true;
    }
}