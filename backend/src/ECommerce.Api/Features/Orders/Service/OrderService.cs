using Dapper;
using ECommerce.Api.Data;
using ECommerce.Api.Features.Items.Service;
using ECommerce.Api.Features.Orders.Model;
using ECommerce.Api.Models;

namespace ECommerce.Api.Features.Orders.Service;

public sealed class OrderService : IOrderService
{
    private readonly IDbConnectionFactory _connectionFactory;

    public OrderService(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<CheckoutResponse> CheckoutAsync(CheckoutRequest request, CancellationToken cancellationToken = default)
    {
        CheckoutRequestPolicy.Validate(request);
        var normalizedLines = CheckoutRequestPolicy.NormalizeLines(request.Items);

        var itemIds = normalizedLines.Select(line => line.ItemId).Distinct().ToArray();

        await using var connection = await _connectionFactory.OpenConnectionAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);

        const string itemSql = """
            select
                id as Id,
                name as Name,
                price as Price,
                stock as Stock,
                is_active as IsActive
            from items
            where id = any(@ItemIds)
            for update;
            """;

        var dbItems = (await connection.QueryAsync<CheckoutItemDbRow>(new CommandDefinition(
            itemSql,
            new { ItemIds = itemIds },
            transaction,
            cancellationToken: cancellationToken))).ToDictionary(item => item.Id);

        var summaries = new List<CheckoutItemSummary>(normalizedLines.Count);
        decimal totalAmount = 0;

        foreach (var line in normalizedLines)
        {
            if (!dbItems.TryGetValue(line.ItemId, out var dbItem))
            {
                throw new ValidationException($"Item {line.ItemId} does not exist.");
            }

            if (!dbItem.IsActive)
            {
                throw new ValidationException($"Item '{dbItem.Name}' is inactive.");
            }

            if (dbItem.Stock < line.Quantity)
            {
                throw new ConflictException($"Not enough stock for item '{dbItem.Name}'.");
            }

            var lineTotal = StockPolicy.CalculateLineTotal(dbItem.Price, line.Quantity);
            totalAmount += lineTotal;

            summaries.Add(new CheckoutItemSummary
            {
                ItemId = dbItem.Id,
                Name = dbItem.Name,
                Quantity = line.Quantity,
                UnitPrice = dbItem.Price,
                LineTotal = lineTotal
            });
        }

        var orderInsert = await connection.QuerySingleAsync<OrderInsertRow>(new CommandDefinition(
            """
            insert into orders (customer_name, customer_email, customer_phone, total_amount, currency, status)
            values (@CustomerName, @CustomerEmail, @CustomerPhone, @TotalAmount, 'THB', 'pending')
            returning id as OrderId, created_at as CreatedAt;
            """,
            new
            {
                request.CustomerName,
                request.CustomerEmail,
                request.CustomerPhone,
                TotalAmount = decimal.Round(totalAmount, 2, MidpointRounding.AwayFromZero)
            },
            transaction,
            cancellationToken: cancellationToken));

        const string orderItemSql = """
            insert into order_items (order_id, item_id, quantity, unit_price, line_total)
            values (@OrderId, @ItemId, @Quantity, @UnitPrice, @LineTotal);
            """;

        const string stockUpdateSql = """
            update items
            set stock = stock - @Quantity,
                updated_at = timezone('utc', now())
            where id = @ItemId;
            """;

        const string movementSql = """
            insert into stock_movements (item_id, delta, reason, source, order_id)
            values (@ItemId, @Delta, @Reason, 'order_checkout', @OrderId);
            """;

        foreach (var line in summaries)
        {
            await connection.ExecuteAsync(new CommandDefinition(orderItemSql, new
            {
                OrderId = orderInsert.OrderId,
                line.ItemId,
                line.Quantity,
                line.UnitPrice,
                line.LineTotal
            }, transaction, cancellationToken: cancellationToken));

            await connection.ExecuteAsync(new CommandDefinition(stockUpdateSql, new
            {
                line.ItemId,
                line.Quantity
            }, transaction, cancellationToken: cancellationToken));

            await connection.ExecuteAsync(new CommandDefinition(movementSql, new
            {
                line.ItemId,
                Delta = -line.Quantity,
                Reason = "Checkout order",
                OrderId = orderInsert.OrderId
            }, transaction, cancellationToken: cancellationToken));
        }

        await connection.ExecuteAsync(new CommandDefinition(
            "update orders set status = 'confirmed' where id = @OrderId;",
            new { orderInsert.OrderId },
            transaction,
            cancellationToken: cancellationToken));

        await transaction.CommitAsync(cancellationToken);

        return new CheckoutResponse
        {
            OrderId = orderInsert.OrderId,
            TotalAmount = decimal.Round(totalAmount, 2, MidpointRounding.AwayFromZero),
            Currency = "THB",
            CreatedAt = orderInsert.CreatedAt,
            Items = summaries
        };
    }

    public async Task<IReadOnlyList<AdminOrderSummaryDto>> ListOrdersForAdminAsync(
        CancellationToken cancellationToken = default)
    {
        const string sql = """
            select
                o.id as Id,
                o.customer_name as CustomerName,
                o.customer_email as CustomerEmail,
                o.customer_phone as CustomerPhone,
                o.total_amount as TotalAmount,
                o.currency as Currency,
                o.status as Status,
                o.created_at as CreatedAt,
                (
                    select count(*)::integer
                    from order_items oi
                    where oi.order_id = o.id
                ) as LineCount
            from orders o
            order by o.created_at desc;
            """;

        await using var connection = await _connectionFactory.OpenConnectionAsync(cancellationToken);
        var rows = await connection.QueryAsync<AdminOrderSummaryDto>(
            new CommandDefinition(sql, cancellationToken: cancellationToken));
        return rows.ToList();
    }

    public async Task<AdminOrderDetailDto?> GetOrderDetailForAdminAsync(
        Guid orderId,
        CancellationToken cancellationToken = default)
    {
        const string orderSql = """
            select
                o.id as Id,
                o.customer_name as CustomerName,
                o.customer_email as CustomerEmail,
                o.customer_phone as CustomerPhone,
                o.total_amount as TotalAmount,
                o.currency as Currency,
                o.status as Status,
                o.created_at as CreatedAt,
                o.updated_at as UpdatedAt
            from orders o
            where o.id = @OrderId;
            """;

        const string linesSql = """
            select
                oi.item_id as ItemId,
                i.name as Name,
                oi.quantity as Quantity,
                oi.unit_price as UnitPrice,
                oi.line_total as LineTotal
            from order_items oi
            inner join items i on i.id = oi.item_id
            where oi.order_id = @OrderId
            order by oi.created_at;
            """;

        await using var connection = await _connectionFactory.OpenConnectionAsync(cancellationToken);
        var header = await connection.QuerySingleOrDefaultAsync<AdminOrderDetailDbRow>(
            new CommandDefinition(orderSql, new { OrderId = orderId }, cancellationToken: cancellationToken));

        if (header is null)
        {
            return null;
        }

        var lines = (await connection.QueryAsync<AdminOrderLineDto>(
            new CommandDefinition(linesSql, new { OrderId = orderId }, cancellationToken: cancellationToken))).ToList();

        return new AdminOrderDetailDto
        {
            Id = header.Id,
            CustomerName = header.CustomerName,
            CustomerEmail = header.CustomerEmail,
            CustomerPhone = header.CustomerPhone,
            TotalAmount = header.TotalAmount,
            Currency = header.Currency,
            Status = header.Status,
            CreatedAt = header.CreatedAt,
            UpdatedAt = header.UpdatedAt,
            Items = lines
        };
    }

    private sealed class AdminOrderDetailDbRow
    {
        public Guid Id { get; init; }
        public string CustomerName { get; init; } = string.Empty;
        public string CustomerEmail { get; init; } = string.Empty;
        public string? CustomerPhone { get; init; }
        public decimal TotalAmount { get; init; }
        public string Currency { get; init; } = string.Empty;
        public string Status { get; init; } = string.Empty;
        public DateTimeOffset CreatedAt { get; init; }
        public DateTimeOffset UpdatedAt { get; init; }
    }

    private sealed class CheckoutItemDbRow
    {
        public Guid Id { get; init; }
        public string Name { get; init; } = string.Empty;
        public decimal Price { get; init; }
        public int Stock { get; init; }
        public bool IsActive { get; init; }
    }

    private sealed class OrderInsertRow
    {
        public Guid OrderId { get; init; }
        public DateTimeOffset CreatedAt { get; init; }
    }
}
