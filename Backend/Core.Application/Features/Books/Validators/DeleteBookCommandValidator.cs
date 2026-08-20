using System;
using Core.Application.Features.Books.Commands;
using FluentValidation;

namespace Core.Application.Features.Books.Validators;

public class DeleteBookCommandValidator : AbstractValidator<DeleteBookCommand>
{
    public DeleteBookCommandValidator()
    {
        RuleFor(x => x.BookId)
            .NotEmpty().WithMessage("Book ID is required.")
            .NotEqual(Guid.Empty).WithMessage("Book ID cannot be empty.");
    }
}