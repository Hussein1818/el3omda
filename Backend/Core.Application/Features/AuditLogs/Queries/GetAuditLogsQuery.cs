using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Core.Application.Contracts;
using Core.Application.DTOs.AuditLogs;
using Core.Domain.Entities;
using MediatR;

namespace Core.Application.Features.AuditLogs.Queries;

public record GetAuditLogsQuery() : IRequest<IReadOnlyList<AuditLogResponseDto>>;

public class GetAuditLogsQueryHandler : IRequestHandler<GetAuditLogsQuery, IReadOnlyList<AuditLogResponseDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetAuditLogsQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<AuditLogResponseDto>> Handle(GetAuditLogsQuery request, CancellationToken cancellationToken)
    {
        var repository = _unitOfWork.Repository<AuditLog>();
        var logs = await repository.GetAllAsync();

        return logs.OrderByDescending(l => l.CreatedAt)
                   .Select(l => new AuditLogResponseDto(
                       l.Id, l.ActionType, l.EntityName, l.EntityId, l.Amount, l.Details, l.CreatedAt))
                   .ToList();
    }
}