using System;
using Core.Application.Features.Books.Commands;
using FluentValidation;

namespace Core.Application.Features.Books.Validators;

public class UpdateBookCommandValidator : AbstractValidator<UpdateBookCommand>
{
    public UpdateBookCommandValidator()
    {
        RuleFor(x => x.BookId)
            .NotEmpty().WithMessage("Book ID is required.")
            .NotEqual(Guid.Empty).WithMessage("Book ID cannot be empty.");

        RuleFor(x => x.Dto.Name)
            .NotEmpty().WithMessage("Book name is required.")
            .MaximumLength(150).WithMessage("Book name must not exceed 150 characters.");

        RuleFor(x => x.Dto.Subject)
            .NotEmpty().WithMessage("Subject is required.")
            .MaximumLength(100).WithMessage("Subject must not exceed 100 characters.");

        RuleFor(x => x.Dto.Stage)
            .IsInEnum().WithMessage("Invalid educational stage selected.");

        RuleFor(x => x.Dto.Year)
            .IsInEnum().WithMessage("Invalid academic year selected.");

        RuleFor(x => x.Dto.PortraitPrice)
            .GreaterThanOrEqualTo(0).WithMessage("Portrait price cannot be negative.");

        RuleFor(x => x.Dto.LandscapePrice)
            .GreaterThanOrEqualTo(0).WithMessage("Landscape price cannot be negative.");
    }
}