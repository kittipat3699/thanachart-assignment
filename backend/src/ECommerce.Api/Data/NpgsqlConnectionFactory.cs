using ECommerce.Api.Models;
using Microsoft.Extensions.Options;
using Npgsql;

namespace ECommerce.Api.Data;

public sealed class NpgsqlConnectionFactory : IDbConnectionFactory
{
    private readonly string _connectionString;

    public NpgsqlConnectionFactory(IOptions<SupabaseOptions> options)
    {
        _connectionString = options.Value.DbConnectionString;

        if (string.IsNullOrWhiteSpace(_connectionString))
        {
            throw new InvalidOperationException("Supabase:DbConnectionString is required.");
        }
    }

    public async Task<NpgsqlConnection> OpenConnectionAsync(CancellationToken cancellationToken = default)
    {
        var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync(cancellationToken);
        return connection;
    }
}
