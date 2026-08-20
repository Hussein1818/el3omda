using Core.Application.Features.Dashboard.Commands;
using FluentValidation;

namespace Core.Application.Features.Dashboard.Validators;

public class PrintNextBookingCommandValidator : AbstractValidator<PrintNextBookingCommand>
{
    public PrintNextBookingCommandValidator()
    {
        RuleFor(x => x.Dto.BookId)
            .NotEmpty().WithMessage("Book ID is required for printing.");

        RuleFor(x => x.Dto.Format)
            .IsInEnum().WithMessage("Invalid print format provided.");
    }
}