using System;
using Core.Domain.Enums;

namespace Core.Application.DTOs.Bookings;

public record CreateBookingRequestDto(
    string StudentName,
    Guid BookId,
    PrintFormat PrintFormat,
    decimal PaidAmount
);