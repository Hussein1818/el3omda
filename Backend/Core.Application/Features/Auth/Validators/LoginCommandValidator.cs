using Core.Application.Features.Auth.Commands;
using FluentValidation;

namespace Core.Application.Features.Auth.Validators;

public class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.Dto.Username).NotEmpty().WithMessage("Username is required.");
        RuleFor(x => x.Dto.Password).NotEmpty().WithMessage("Password is required.");
    }
}