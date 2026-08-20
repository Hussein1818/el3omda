using System;
using Core.Domain.Common;
using Core.Domain.Enums;

namespace Core.Domain.Entities;

public class AuditLog : BaseEntity
{
    public AuditActionType ActionType { get; private set; }
    public string EntityName { get; private set; } = null!;
    public Guid EntityId { get; private set; }
    public decimal? Amount { get; private set; }
    public string? Details { get; private set; }

    private AuditLog() { }

    public AuditLog(AuditActionType actionType, string entityName, Guid entityId, decimal? amount, string? details)
    {
        ActionType = actionType;
        EntityName = entityName;
        EntityId = entityId;
        Amount = amount;
        Details = details;
    }
}