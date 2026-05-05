using Dapper;
using ECommerce.Api.Data;

namespace ECommerce.Api.Features.Admin.Users.Service;

public sealed class AdminAuthorizationService : IAdminAuthorizationService
{
    private readonly IDbConnectionFactory _connectionFactory;

    public AdminAuthorizationService(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<bool> IsActiveAdminAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        const string sql = """
            select exists (
                select 1
                from admin_profiles
                where user_id = @UserId
                    and role = 'admin'
                    and is_active = true
            );
            """;

        await using var connection = await _connectionFactory.OpenConnectionAsync(cancellationToken);
        return await connection.ExecuteScalarAsync<bool>(new CommandDefinition(sql, new { UserId = userId }, cancellationToken: cancellationToken));
    }
}
