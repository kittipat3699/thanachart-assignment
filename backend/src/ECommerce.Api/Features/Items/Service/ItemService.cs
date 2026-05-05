using Dapper;
using ECommerce.Api.Data;
using ECommerce.Api.Features.Items.Model;
using ECommerce.Api.Models;
using Npgsql;

namespace ECommerce.Api.Features.Items.Service;

public sealed class ItemService : IItemService
{
    private readonly IDbConnectionFactory _connectionFactory;

    public ItemService(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IReadOnlyList<ItemDto>> GetActiveItemsAsync(CancellationToken cancellationToken = default)
    {
        const string sql = $"""
            select {SelectColumns}
            from items
            where is_active = true
            order by created_at desc;
            """;

        await using var connection = await _connectionFactory.OpenConnectionAsync(cancellationToken);
        var rows = await connection.QueryAsync<ItemDto>(new CommandDefinition(sql, cancellationToken: cancellationToken));
        return rows.ToList();
    }

    public async Task<IReadOnlyList<ItemDto>> GetAllItemsAsync(CancellationToken cancellationToken = default)
    {
        const string sql = $"""
            select {SelectColumns}
            from items
            order by created_at desc;
            """;

        await using var connection = await _connectionFactory.OpenConnectionAsync(cancellationToken);
        var rows = await connection.QueryAsync<ItemDto>(new CommandDefinition(sql, cancellationToken: cancellationToken));
        return rows.ToList();
    }

    public async Task<ItemDto?> GetItemByIdAsync(Guid itemId, CancellationToken cancellationToken = default)
    {
        const string sql = $"""
            select {SelectColumns}
            from items
            where id = @ItemId;
            """;

        await using var connection = await _connectionFactory.OpenConnectionAsync(cancellationToken);
        return await connection.QuerySingleOrDefaultAsync<ItemDto>(
            new CommandDefinition(sql, new { ItemId = itemId }, cancellationToken: cancellationToken));
    }

    public async Task<ItemDto> CreateItemAsync(CreateItemRequest request, CancellationToken cancellationToken = default)
    {
        ValidatePrice(request.Price);

        const string sql = $"""
            insert into items (name, sku, description, price, stock, image_url, is_active)
            values (@Name, @Sku, @Description, @Price, @Stock, @ImageUrl, @IsActive)
            returning {SelectColumns};
            """;

        await using var connection = await _connectionFactory.OpenConnectionAsync(cancellationToken);

        try
        {
            return await connection.QuerySingleAsync<ItemDto>(
                new CommandDefinition(sql, request, cancellationToken: cancellationToken));
        }
        catch (PostgresException ex) when (ex.SqlState == PostgresErrorCodes.UniqueViolation)
        {
            throw new ConflictException("SKU already exists.");
        }
    }

    public async Task<ItemDto?> UpdateItemAsync(Guid itemId, UpdateItemRequest request, CancellationToken cancellationToken = default)
    {
        ValidatePrice(request.Price);

        const string sql = $"""
            update items
            set name = @Name,
                sku = @Sku,
                description = @Description,
                price = @Price,
                stock = @Stock,
                image_url = @ImageUrl,
                is_active = @IsActive,
                updated_at = timezone('utc', now())
            where id = @ItemId
            returning {SelectColumns};
            """;

        await using var connection = await _connectionFactory.OpenConnectionAsync(cancellationToken);

        try
        {
            return await connection.QuerySingleOrDefaultAsync<ItemDto>(
                new CommandDefinition(sql, new
                {
                    ItemId = itemId,
                    request.Name,
                    request.Sku,
                    request.Description,
                    request.Price,
                    request.Stock,
                    request.ImageUrl,
                    request.IsActive
                }, cancellationToken: cancellationToken));
        }
        catch (PostgresException ex) when (ex.SqlState == PostgresErrorCodes.UniqueViolation)
        {
            throw new ConflictException("SKU already exists.");
        }
    }

    public async Task<bool> DeleteItemAsync(Guid itemId, CancellationToken cancellationToken = default)
    {
        const string sql = "delete from items where id = @ItemId;";

        await using var connection = await _connectionFactory.OpenConnectionAsync(cancellationToken);
        try
        {
            var affectedRows = await connection.ExecuteAsync(
                new CommandDefinition(sql, new { ItemId = itemId }, cancellationToken: cancellationToken));
            return affectedRows > 0;
        }
        catch (PostgresException ex) when (ex.SqlState == PostgresErrorCodes.ForeignKeyViolation)
        {
            throw new ConflictException("Cannot delete item that is already used in orders.");
        }
    }

    public async Task<ItemDto?> AdjustStockAsync(Guid itemId, Guid adjustedBy, AdjustStockRequest request, CancellationToken cancellationToken = default)
    {
        if (request.Delta == 0)
        {
            throw new ValidationException("Delta cannot be zero.");
        }

        await using var connection = await _connectionFactory.OpenConnectionAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);

        const string lockSql = """
            select id as Id, stock as Stock
            from items
            where id = @ItemId
            for update;
            """;

        var lockedItem = await connection.QuerySingleOrDefaultAsync<ItemStockRow>(
            new CommandDefinition(lockSql, new { ItemId = itemId }, transaction, cancellationToken: cancellationToken));

        if (lockedItem is null)
        {
            await transaction.RollbackAsync(cancellationToken);
            return null;
        }

        var nextStock = StockPolicy.CalculateAdjustedStock(lockedItem.Stock, request.Delta);

        const string updateSql = """
            update items
            set stock = @NextStock,
                updated_at = timezone('utc', now())
            where id = @ItemId;
            """;

        await connection.ExecuteAsync(new CommandDefinition(
            updateSql,
            new { ItemId = itemId, NextStock = nextStock },
            transaction,
            cancellationToken: cancellationToken));

        const string movementSql = """
            insert into stock_movements (item_id, delta, reason, source, adjusted_by)
            values (@ItemId, @Delta, @Reason, 'admin_adjustment', @AdjustedBy);
            """;

        await connection.ExecuteAsync(new CommandDefinition(
            movementSql,
            new
            {
                ItemId = itemId,
                request.Delta,
                request.Reason,
                AdjustedBy = adjustedBy
            },
            transaction,
            cancellationToken: cancellationToken));

        const string selectSql = $"""
            select {SelectColumns}
            from items
            where id = @ItemId;
            """;

        var updatedItem = await connection.QuerySingleAsync<ItemDto>(new CommandDefinition(
            selectSql,
            new { ItemId = itemId },
            transaction,
            cancellationToken: cancellationToken));

        await transaction.CommitAsync(cancellationToken);
        return updatedItem;
    }

    private static void ValidatePrice(decimal price)
    {
        if (price <= 0)
        {
            throw new ValidationException("Price must be greater than zero.");
        }
    }

    private const string SelectColumns = """
        id as Id,
        name as Name,
        sku as Sku,
        description as Description,
        price as Price,
        stock as Stock,
        image_url as ImageUrl,
        is_active as IsActive,
        created_at as CreatedAt,
        updated_at as UpdatedAt
        """;

    private sealed class ItemStockRow
    {
        public Guid Id { get; init; }
        public int Stock { get; init; }
    }
}
