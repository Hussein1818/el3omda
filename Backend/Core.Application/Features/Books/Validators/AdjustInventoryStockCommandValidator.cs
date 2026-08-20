using Core.Application.Features.Books.Commands;
using FluentValidation;

namespace Core.Application.Features.Books.Validators;

public class AdjustInventoryStockCommandValidator : AbstractValidator<AdjustInventoryStockCommand>
{
    public AdjustInventoryStockCommandValidator()
    {
        RuleFor(x => x.Dto.BookId)
            .NotEmpty().WithMessage("Book ID is required.");

        RuleFor(x => x.Dto.Format)
            .IsInEnum().WithMessage("Invalid print format.");

        RuleFor(x => x.Dto.Quantity)
            .GreaterThan(0).WithMessage("Quantity must be greater than zero.");
    }
}