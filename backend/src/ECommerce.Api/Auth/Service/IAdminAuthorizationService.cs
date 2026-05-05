namespace ECommerce.Api.Auth.Service;

public interface IAdminAuthorizationService
{
    Task<bool> IsActiveAdminAsync(Guid userId, CancellationToken cancellationToken = default);
}
