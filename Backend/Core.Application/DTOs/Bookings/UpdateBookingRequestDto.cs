using System;
using Core.Domain.Enums;

namespace Core.Application.DTOs.Bookings;

public record UpdateBookingRequestDto(
    string StudentName,
    Guid BookId,
    PrintFormat PrintFormat,
    decimal PaidAmount,
    decimal RemainingAmount
);