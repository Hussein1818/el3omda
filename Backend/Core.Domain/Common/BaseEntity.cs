using System;

namespace Core.Domain.Common;

public abstract class BaseEntity
{
    public Guid Id { get; protected set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; protected set; } = EgyptTimeProvider.Now();
    public DateTime? UpdatedAt { get; protected set; }

    public void UpdateTimestamp()
    {
        UpdatedAt = EgyptTimeProvider.Now();
    }
}