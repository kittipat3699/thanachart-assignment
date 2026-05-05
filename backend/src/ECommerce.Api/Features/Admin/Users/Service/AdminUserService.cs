using Dapper;
using ECommerce.Api.Data;
using ECommerce.Api.Features.Admin.Users.Model;
using ECommerce.Api.Models;
using Npgsql;

namespace ECommerce.Api.Features.Admin.Users.Service;

public sealed class AdminUserService : IAdminUserService
{
    private readonly IDbConnectionFactory _connectionFactory;
    private readonly ISupabaseAuthAdminClient _supabaseAuthAdminClient;

    public AdminUserService(IDbConnectionFactory connectionFactory, ISupabaseAuthAdminClient supabaseAuthAdminClient)
    {
        _connectionFactory = connectionFactory;
        _supabaseAuthAdminClient = supabaseAuthAdminClient;
    }

    public async Task<IReadOnlyList<AdminUserDto>> GetAdminUsersAsync(CancellationToken cancellationToken = default)
    {
        var sql = $"""
            {AdminSelect}
            order by ap.created_at desc;
            """;

        await using var connection = await _connectionFactory.OpenConnectionAsync(cancellationToken);
        var rows = await connection.QueryAsync<AdminUserDto>(new CommandDefinition(sql, cancellationToken: cancellationToken));
        return rows.ToList();
    }

    public async Task<AdminUserDto> CreateAdminUserAsync(CreateAdminUserRequest request, CancellationToken cancellationToken = default)
    {
        var userId = await _supabaseAuthAdminClient.CreateUserAsync(
            request.Email,
            request.Password,
            request.EmailConfirmed,
            cancellationToken);

        await using var connection = await _connectionFactory.OpenConnectionAsync(cancellationToken);

        try
        {
            const string insertSql = """
                insert into admin_profiles (user_id, display_name, role, is_active)
                values (@UserId, @DisplayName, 'admin', true);
                """;

            await connection.ExecuteAsync(new CommandDefinition(insertSql, new
            {
                UserId = userId,
                request.DisplayName
            }, cancellationToken: cancellationToken));

            return await GetAdminUserOrThrowAsync(connection, userId, cancellationToken);
        }
        catch (Exception)
        {
            await _supabaseAuthAdminClient.DeleteUserAsync(userId, cancellationToken);
            throw;
        }
    }

    public async Task<AdminUserDto?> UpdateAdminUserAsync(Guid userId, UpdateAdminUserRequest request, CancellationToken cancellationToken = default)
    {
        const string updateSql = """
            update admin_profiles
            set display_name = coalesce(@DisplayName, display_name),
                is_active = coalesce(@IsActive, is_active),
                updated_at = timezone('utc', now())
            where user_id = @UserId
            returning user_id;
            """;

        await using var connection = await _connectionFactory.OpenConnectionAsync(cancellationToken);
        var updatedUserId = await connection.ExecuteScalarAsync<Guid?>(new CommandDefinition(updateSql, new
        {
            UserId = userId,
            request.DisplayName,
            request.IsActive
        }, cancellationToken: cancellationToken));

        if (!updatedUserId.HasValue)
        {
            return null;
        }

        return await GetAdminUserOrThrowAsync(connection, userId, cancellationToken);
    }

    public async Task<bool> DeleteAdminUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _supabaseAuthAdminClient.DeleteUserAsync(userId, cancellationToken);
    }

    private static async Task<AdminUserDto> GetAdminUserOrThrowAsync(
        NpgsqlConnection connection,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var sql = $"""
            {AdminSelect}
            where ap.user_id = @UserId;
            """;

        var result = await connection.QuerySingleOrDefaultAsync<AdminUserDto>(
            new CommandDefinition(sql, new { UserId = userId }, cancellationToken: cancellationToken));

        if (result is null)
        {
            throw new ValidationException("Admin user not found after write operation.");
        }

        return result;
    }

    private const string AdminSelect = """
        select
            ap.user_id as UserId,
            au.email as Email,
            ap.display_name as DisplayName,
            ap.is_active as IsActive,
            ap.role as Role,
            ap.created_at as CreatedAt
        from admin_profiles ap
        join auth.users au on au.id = ap.user_id
        """;
}
