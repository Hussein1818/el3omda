using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Core.Application.Contracts;
using Core.Application.DTOs.Settings;
using Core.Domain.Entities;
using MediatR;

namespace Core.Application.Features.Settings.Commands;

public record ChangePasswordCommand(ChangePasswordRequestDto Dto, string Username) : IRequest<bool>;

public class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand, bool>
{
    private readonly IUnitOfWork _unitOfWork;

    public ChangePasswordCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
    {
        var adminRepository = _unitOfWork.Repository<Admin>();

        var admins = await adminRepository.FindAsync(a => a.Username == request.Username);
        var admin = admins.FirstOrDefault();

        if (admin == null)
        {
            var allAdmins = await adminRepository.GetAllAsync();
            admin = allAdmins.FirstOrDefault();

            if (admin == null)
            {
                throw new UnauthorizedAccessException("Admin account not found in the system.");
            }
        }

        if (!BCrypt.Net.BCrypt.Verify(request.Dto.CurrentPassword, admin.PasswordHash))
        {
            throw new InvalidOperationException("Current password is incorrect.");
        }

        var newPasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Dto.NewPassword);
        admin.UpdatePassword(newPasswordHash);

        adminRepository.Update(admin);
        await _unitOfWork.CompleteAsync(cancellationToken);

        return true;
    }
}