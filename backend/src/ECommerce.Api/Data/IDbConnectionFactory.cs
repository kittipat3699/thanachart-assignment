using Npgsql;

namespace ECommerce.Api.Data;

public interface IDbConnectionFactory
{
    Task<NpgsqlConnection> OpenConnectionAsync(CancellationToken cancellationToken = default);
}
