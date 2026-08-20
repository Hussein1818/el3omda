using Core.Domain.Enums;

namespace Core.Application.DTOs.Dashboard;

public record BookPrintSummaryDto(
    string BookName,
    string Subject,
    EducationalStage Stage,
    AcademicYear Year,
    PrintFormat PrintFormat,
    int TotalToPrint
);