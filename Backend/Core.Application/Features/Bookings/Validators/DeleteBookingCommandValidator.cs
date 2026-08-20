using System;
using Core.Application.Features.Bookings.Commands;
using FluentValidation;

namespace Core.Application.Features.Bookings.Validators;

public class DeleteBookingCommandValidator : AbstractValidator<DeleteBookingCommand>
{
    public DeleteBookingCommandValidator()
    {
        RuleFor(x => x.BookingId)
            .NotEmpty().WithMessage("Booking ID is required.")
            .NotEqual(Guid.Empty).WithMessage("Booking ID cannot be empty.");
    }
}