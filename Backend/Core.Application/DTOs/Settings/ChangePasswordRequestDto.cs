namespace Core.Application.DTOs.Settings;

public record ChangePasswordRequestDto(
    string CurrentPassword,
    string NewPassword,
    string ConfirmNewPassword
);