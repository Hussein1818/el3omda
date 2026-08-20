using System;
using Core.Domain.Enums;

namespace Core.Application.DTOs.Bookings;

public record BookingResponseDto(
    Guid Id,
    string StudentName,
    string BookName,
    string Subject,
    EducationalStage Stage,
    AcademicYear Year,
    PrintFormat PrintFormat,
    decimal PaidAmount,
    decimal RemainingAmount,
    bool IsPrinted,
    bool IsDelivered,
    DateTime CreatedAt,
    DateTime? DeliveryDate
);