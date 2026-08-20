using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Core.Application.Contracts;
using Core.Domain.Entities;
using MediatR;

namespace Core.Application.Features.Auth.Commands;

public record RevokeTokenCommand(string RefreshToken) : IRequest<bool>;

public class RevokeTokenCommandHandler : IRequestHandler<RevokeTokenCommand, bool>
{
    private readonly IUnitOfWork _unitOfWork;

    public RevokeTokenCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(RevokeTokenCommand request, CancellationToken cancellationToken)
    {
        var adminRepository = _unitOfWork.Repository<Admin>();
        var admins = await adminRepository.FindAsync(a => a.RefreshToken == request.RefreshToken);
        var admin = admins.FirstOrDefault();

        if (admin != null)
        {
            admin.UpdateRefreshToken(string.Empty, DateTime.UtcNow.AddDays(-1));
            adminRepository.Update(admin);
            await _unitOfWork.CompleteAsync(cancellationToken);
        }

        return true;
    }
}