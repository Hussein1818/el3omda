using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Core.Application.Contracts;
using Core.Domain.Entities;
using MediatR;

namespace Core.Application.Features.Bookings.Commands;

public record DeleteBookingCommand(Guid BookingId) : IRequest<bool>;

public class DeleteBookingCommandHandler : IRequestHandler<DeleteBookingCommand, bool>
{
    private readonly IUnitOfWork _unitOfWork;

    public DeleteBookingCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteBookingCommand request, CancellationToken cancellationToken)
    {
        var bookingRepository = _unitOfWork.Repository<Booking>();
        var booking = await bookingRepository.GetByIdAsync(request.BookingId);

        if (booking == null)
        {
            throw new KeyNotFoundException($"Booking with ID {request.BookingId} was not found.");
        }

        bookingRepository.Delete(booking);
        await _unitOfWork.CompleteAsync(cancellationToken);

        return true;
    }
}