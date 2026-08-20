using Core.Domain.Enums;

namespace Core.Application.DTOs.Books;

public record UpdateBookRequestDto(
    string Name,
    string Subject,
    EducationalStage Stage,
    AcademicYear Year,
    decimal PortraitPrice,
    decimal LandscapePrice
);