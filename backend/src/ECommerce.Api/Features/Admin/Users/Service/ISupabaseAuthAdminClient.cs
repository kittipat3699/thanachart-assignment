namespace ECommerce.Api.Features.Admin.Users.Service;

public interface ISupabaseAuthAdminClient
{
    Task<Guid> CreateUserAsync(string email, string password, bool emailConfirmed, CancellationToken cancellationToken = default);
    Task<bool> DeleteUserAsync(Guid userId, CancellationToken cancellationToken = default);
}
