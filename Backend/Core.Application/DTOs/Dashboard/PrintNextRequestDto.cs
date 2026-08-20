using System;
using Core.Domain.Enums;

namespace Core.Application.DTOs.Dashboard;

public record PrintNextRequestDto(
    Guid BookId,
    PrintFormat Format
);