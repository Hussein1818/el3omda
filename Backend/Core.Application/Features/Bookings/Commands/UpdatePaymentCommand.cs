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

public record UpdatePaymentCommand(Guid BookingId, UpdatePaymentRequestDto Dto) : IRequest<bool>;

public class UpdatePaymentCommandHandler : IRequestHandler<UpdatePaymentCommand, bool>
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdatePaymentCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(UpdatePaymentCommand request, CancellationToken cancellationToken)
    {
        var repository = _unitOfWork.Repository<Booking>();
        var booking = await repository.GetByIdAsync(request.BookingId);

        if (booking == null)
            throw new KeyNotFoundException($"Booking with ID {request.BookingId} was not found.");

        if (request.Dto.Amount > 0)
        {
            booking.AddPayment(request.Dto.Amount);
        }
        else if (request.Dto.Amount < 0)
        {
            booking.RefundPayment(Math.Abs(request.Dto.Amount));
        }

        repository.Update(booking);

        string actionDetails = request.Dto.Amount >= 0 ? "Payment Added" : "Payment Refunded";
        var auditLog = new AuditLog(AuditActionType.PaymentUpdated, nameof(Booking), booking.Id, request.Dto.Amount, $"{actionDetails} for {booking.StudentName}");
        await _unitOfWork.Repository<AuditLog>().AddAsync(auditLog);

        await _unitOfWork.CompleteAsync(cancellationToken);
        return true;
    }
}