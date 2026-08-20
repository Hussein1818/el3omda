using System;
using Core.Domain.Enums;

namespace Core.Application.DTOs.Books;

public record BookResponseDto(
    Guid Id,
    string Name,
    string Subject,
    EducationalStage Stage,
    AcademicYear Year,
    decimal PortraitPrice,
    decimal LandscapePrice
);