namespace ECommerce.Api.Features.Admin.Users.Service;

public interface IAdminAuthorizationService
{
    Task<bool> IsActiveAdminAsync(Guid userId, CancellationToken cancellationToken = default);
}
