using Core.Application.Features.Bookings.Queries;
using FluentValidation;

namespace Core.Application.Features.Bookings.Validators;

public class GetAllBookingsQueryValidator : AbstractValidator<GetAllBookingsQuery>
{
    public GetAllBookingsQueryValidator()
    {
        RuleFor(x => x.PageNumber)
            .GreaterThanOrEqualTo(1).WithMessage("Page number must be at least 1.");

        RuleFor(x => x.PageSize)
            .GreaterThanOrEqualTo(1).WithMessage("Page size must be at least 1.")
            .LessThanOrEqualTo(100).WithMessage("Page size cannot exceed 100.");
    }
}