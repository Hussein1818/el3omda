using Core.Application.Features.Settings.Commands;
using FluentValidation;

namespace Core.Application.Features.Settings.Validators;

public class ChangePasswordCommandValidator : AbstractValidator<ChangePasswordCommand>
{
    public ChangePasswordCommandValidator()
    {
        RuleFor(x => x.Dto.CurrentPassword)
            .NotEmpty().WithMessage("Current password is required.");

        RuleFor(x => x.Dto.NewPassword)
            .NotEmpty().WithMessage("New password is required.")
            .MinimumLength(6).WithMessage("New password must be at least 6 characters long.");

        RuleFor(x => x.Dto.ConfirmNewPassword)
            .Equal(x => x.Dto.NewPassword).WithMessage("Passwords do not match.");
    }
}