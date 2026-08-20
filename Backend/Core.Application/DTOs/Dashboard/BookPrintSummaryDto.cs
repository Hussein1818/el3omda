using System;
using Core.Domain.Enums;

namespace Core.Application.DTOs.Dashboard;

public record BookPrintSummaryDto(
    Guid BookId,
    string BookName,
    string Subject,
    EducationalStage Stage,
    AcademicYear Year,
    PrintFormat PrintFormat,
    int TotalToPrint
);