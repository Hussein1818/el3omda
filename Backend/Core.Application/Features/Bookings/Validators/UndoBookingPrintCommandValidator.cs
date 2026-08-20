using Core.Application.Features.Bookings.Commands;
using FluentValidation;

namespace Core.Application.Features.Bookings.Validators;

public class UndoBookingPrintCommandValidator : AbstractValidator<UndoBookingPrintCommand>
{
    public UndoBookingPrintCommandValidator()
    {
        RuleFor(x => x.BookingId)
            .NotEmpty().WithMessage("Booking ID is required to undo print status.");
    }
}