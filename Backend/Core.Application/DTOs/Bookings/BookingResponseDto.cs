using System;
using Core.Domain.Enums;

namespace Core.Application.DTOs.Bookings;

public record BookingResponseDto(
    Guid Id,
    string StudentName,
    string BookName,
    PrintFormat PrintFormat,
    decimal PaidAmount,
    decimal RemainingAmount,
    bool IsDelivered,
    DateTime CreatedAt,
    DateTime? DeliveryDate
);