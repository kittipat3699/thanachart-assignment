using ECommerce.Api.Features.Admin.Users.Model;

namespace ECommerce.Api.Features.Admin.Users.Service;

public interface IAdminUserService
{
    Task<IReadOnlyList<AdminUserDto>> GetAdminUsersAsync(CancellationToken cancellationToken = default);
    Task<AdminUserDto> CreateAdminUserAsync(CreateAdminUserRequest request, CancellationToken cancellationToken = default);
    Task<AdminUserDto?> UpdateAdminUserAsync(Guid userId, UpdateAdminUserRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAdminUserAsync(Guid userId, CancellationToken cancellationToken = default);
}
