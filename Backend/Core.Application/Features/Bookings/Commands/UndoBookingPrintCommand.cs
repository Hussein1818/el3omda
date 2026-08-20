using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Core.Application.Contracts;
using Core.Domain.Entities;
using Core.Domain.Enums;
using MediatR;

namespace Core.Application.Features.Bookings.Commands;

public record UndoBookingPrintCommand(Guid BookingId) : IRequest<bool>;

public class UndoBookingPrintCommandHandler : IRequestHandler<UndoBookingPrintCommand, bool>
{
    private readonly IUnitOfWork _unitOfWork;

    public UndoBookingPrintCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(UndoBookingPrintCommand request, CancellationToken cancellationToken)
    {
        var bookingRepo = _unitOfWork.Repository<Booking>();
        var booking = await bookingRepo.GetByIdAsync(request.BookingId);

        if (booking == null)
            throw new KeyNotFoundException($"Booking {request.BookingId} not found.");

        booking.UndoPrint();
        bookingRepo.Update(booking);

        var bookRepo = _unitOfWork.Repository<Book>();
        var book = await bookRepo.GetByIdAsync(booking.BookId);
        if (book != null)
        {
            book.RemoveStock(booking.PrintFormat, 1);
            bookRepo.Update(book);
        }

        var auditLog = new AuditLog(AuditActionType.BookingPrinted, nameof(Booking), booking.Id, null, $"Undid print status for booking {booking.StudentName}");
        await _unitOfWork.Repository<AuditLog>().AddAsync(auditLog);

        await _unitOfWork.CompleteAsync(cancellationToken);
        return true;
    }
}