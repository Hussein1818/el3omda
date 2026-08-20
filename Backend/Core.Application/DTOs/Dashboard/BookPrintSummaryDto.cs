using Core.Domain.Enums;

namespace Core.Application.DTOs.Dashboard;

public record BookPrintSummaryDto(
    string BookName,
    EducationalStage Stage,
    AcademicYear Year,
    PrintFormat PrintFormat,
    int TotalToPrint
);