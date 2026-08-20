using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Core.Application.Contracts;
using Core.Application.DTOs.Dashboard;
using Core.Domain.Entities;
using Core.Domain.Enums;
using MediatR;

namespace Core.Application.Features.Dashboard.Commands;

public record PrintNextBookingCommand(PrintNextRequestDto Dto) : IRequest<bool>;

public class PrintNextBookingCommandHandler : IRequestHandler<PrintNextBookingCommand, bool>
{
    private readonly IUnitOfWork _unitOfWork;

    public PrintNextBookingCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(PrintNextBookingCommand request, CancellationToken cancellationToken)
    {
        var bookRepo = _unitOfWork.Repository<Book>();
        var book = await bookRepo.GetByIdAsync(request.Dto.BookId);

        if (book != null)
        {
            book.AddStock(request.Dto.Format, 1);
            bookRepo.Update(book);

            var auditLog = new AuditLog(AuditActionType.BookingPrinted, nameof(Book), book.Id, null, $"Added 1 physical copy to inventory for {book.Name}");
            await _unitOfWork.Repository<AuditLog>().AddAsync(auditLog);
        }

        var bookingRepo = _unitOfWork.Repository<Booking>();
        var pendingBookings = await bookingRepo.FindAsync(b => b.BookId == request.Dto.BookId && b.PrintFormat == request.Dto.Format && !b.IsPrinted && !b.IsDelivered);

        var oldestBooking = pendingBookings.OrderBy(b => b.CreatedAt).FirstOrDefault();

        if (oldestBooking != null)
        {
            oldestBooking.MarkAsPrinted();
            bookingRepo.Update(oldestBooking);
        }

        await _unitOfWork.CompleteAsync(cancellationToken);
        return true;
    }
}