using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Core.Application.Contracts;
using Core.Domain.Entities;
using Core.Domain.Enums;
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

        booking.MarkAsDelivered();
        bookingRepository.Update(booking);

        var auditLog = new AuditLog(
            AuditActionType.BookingDelivered,
            nameof(Booking),
            booking.Id,
            null,
            $"Marked booking as delivered for student: {booking.StudentName}"
        );
        await _unitOfWork.Repository<AuditLog>().AddAsync(auditLog);

        await _unitOfWork.CompleteAsync(cancellationToken);

        return true;
    }
}