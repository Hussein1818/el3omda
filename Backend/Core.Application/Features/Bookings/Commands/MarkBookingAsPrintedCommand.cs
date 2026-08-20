using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Core.Application.Contracts;
using Core.Domain.Entities;
using Core.Domain.Enums;
using MediatR;

namespace Core.Application.Features.Bookings.Commands;

public record MarkBookingAsPrintedCommand(Guid BookingId) : IRequest<bool>;

public class MarkBookingAsPrintedCommandHandler : IRequestHandler<MarkBookingAsPrintedCommand, bool>
{
    private readonly IUnitOfWork _unitOfWork;

    public MarkBookingAsPrintedCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(MarkBookingAsPrintedCommand request, CancellationToken cancellationToken)
    {
        var repository = _unitOfWork.Repository<Booking>();
        var booking = await repository.GetByIdAsync(request.BookingId);

        if (booking == null)
            throw new KeyNotFoundException($"Booking with ID {request.BookingId} was not found.");

        booking.MarkAsPrinted();
        repository.Update(booking);

        var auditLog = new AuditLog(AuditActionType.BookingPrinted, nameof(Booking), booking.Id, null, $"Marked as printed for {booking.StudentName}");
        await _unitOfWork.Repository<AuditLog>().AddAsync(auditLog);

        await _unitOfWork.CompleteAsync(cancellationToken);
        return true;
    }
}