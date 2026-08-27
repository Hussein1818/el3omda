using System;
using Core.Domain.Enums;

namespace Core.Application.DTOs.Books;

public record PrintedBookDto(
    Guid Id,
    string Name,
    string Subject,
    EducationalStage Stage,
    AcademicYear Year,
    int TotalPortraitStock,
    int ReservedPortraitStock,
    int FreePortraitStock,
    int TotalLandscapeStock,
    int ReservedLandscapeStock,
    int FreeLandscapeStock
);