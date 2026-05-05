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
