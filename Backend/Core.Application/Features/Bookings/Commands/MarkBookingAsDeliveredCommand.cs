using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Core.Application.Contracts;
using Core.Domain.Entities;
using MediatR;

namespace Core.Application.Features.Bookings.Commands;

public record MarkBookingAsDeliveredCommand(Guid BookingId) : IRequest<bool>;

public class MarkBookingAsDeliveredCommandHandler : IRequestHandler<MarkBookingAsDeliveredCommand, bool>
{
    private readonly IUnitOfWork _unitOfWork;

    public MarkBookingAsDeliveredCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(MarkBookingAsDeliveredCommand request, CancellationToken cancellationToken)
    {
        var bookingRepository = _unitOfWork.Repository<Booking>();
        var booking = await bookingRepository.GetByIdAsync(request.BookingId);

        if (booking == null)
        {
            throw new KeyNotFoundException($"Booking with ID {request.BookingId} was not found.");
        }

        if (booking.IsDelivered)
        {
            return true;
        }

        booking.MarkAsDelivered();

        bookingRepository.Update(booking);
        await _unitOfWork.CompleteAsync(cancellationToken);

        return true;
    }
}