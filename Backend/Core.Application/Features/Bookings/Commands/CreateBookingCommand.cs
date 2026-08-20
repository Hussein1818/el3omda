using System;
using System.Threading;
using System.Threading.Tasks;
using Core.Application.Contracts;
using Core.Application.DTOs.Bookings;
using Core.Domain.Entities;
using Core.Domain.Enums;
using MediatR;

namespace Core.Application.Features.Bookings.Commands;

public record CreateBookingCommand(CreateBookingRequestDto Dto) : IRequest<Guid>;

public class CreateBookingCommandHandler : IRequestHandler<CreateBookingCommand, Guid>
{
    private readonly IUnitOfWork _unitOfWork;

    public CreateBookingCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CreateBookingCommand request, CancellationToken cancellationToken)
    {
        var bookRepository = _unitOfWork.Repository<Book>();
        var book = await bookRepository.GetByIdAsync(request.Dto.BookId);

        if (book == null)
        {
            throw new Exception($"Book with ID {request.Dto.BookId} was not found.");
        }

        decimal requiredPrice = request.Dto.PrintFormat == PrintFormat.Portrait
            ? book.PortraitPrice
            : book.LandscapePrice;

        if (request.Dto.PaidAmount > requiredPrice)
            throw new InvalidOperationException("Paid amount exceeds the actual format price.");

        decimal remainingAmount = requiredPrice - request.Dto.PaidAmount;

        var booking = new Booking(
            request.Dto.StudentName,
            request.Dto.BookId,
            request.Dto.PrintFormat,
            request.Dto.PaidAmount,
            remainingAmount
        );

        var bookingRepository = _unitOfWork.Repository<Booking>();
        await bookingRepository.AddAsync(booking);

        var auditLog = new AuditLog(
            AuditActionType.BookingCreated,
            nameof(Booking),
            booking.Id,
            request.Dto.PaidAmount,
            $"Created booking for {request.Dto.StudentName}"
        );
        await _unitOfWork.Repository<AuditLog>().AddAsync(auditLog);

        await _unitOfWork.CompleteAsync(cancellationToken);

        return booking.Id;
    }
}