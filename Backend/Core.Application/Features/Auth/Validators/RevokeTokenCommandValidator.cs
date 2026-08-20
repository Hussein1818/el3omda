using Core.Application.Features.Auth.Commands;
using FluentValidation;

namespace Core.Application.Features.Auth.Validators;

public class RevokeTokenCommandValidator : AbstractValidator<RevokeTokenCommand>
{
    public RevokeTokenCommandValidator()
    {
        RuleFor(x => x.RefreshToken)
            .NotEmpty().WithMessage("Refresh token is required.");
    }
}