using System;
using Core.Application.Features.Bookings.Commands;
using FluentValidation;

namespace Core.Application.Features.Bookings.Validators;

public class CreateBookingCommandValidator : AbstractValidator<CreateBookingCommand>
{
    public CreateBookingCommandValidator()
    {
        RuleFor(x => x.Dto.StudentName)
            .NotEmpty().WithMessage("Student name is required.")
            .MaximumLength(150).WithMessage("Student name must not exceed 150 characters.");

        RuleFor(x => x.Dto.BookId)
            .NotEmpty().WithMessage("Book ID is required.")
            .NotEqual(Guid.Empty).WithMessage("Invalid Book ID.");

        RuleFor(x => x.Dto.PrintFormat)
            .IsInEnum().WithMessage("Invalid print format selected.");

        RuleFor(x => x.Dto.PaidAmount)
            .GreaterThanOrEqualTo(0).WithMessage("Paid amount cannot be negative.");
    }
}