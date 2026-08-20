using System;
using Core.Domain.Enums;

namespace Core.Application.DTOs.AuditLogs;

public record AuditLogResponseDto(
    Guid Id,
    AuditActionType ActionType,
    string EntityName,
    Guid EntityId,
    decimal? Amount,
    string? Details,
    DateTime CreatedAt
);