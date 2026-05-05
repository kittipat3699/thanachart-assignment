using Dapper;
using ECommerce.Api.Data;
using ECommerce.Api.Features.Admin.Orders.Model;
using ECommerce.Api.Features.Orders.Model;

namespace ECommerce.Api.Features.Admin.Orders.Service;

public sealed class AdminOrderService : IAdminOrderService
{
    private readonly IDbConnectionFactory _connectionFactory;

    public AdminOrderService(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IReadOnlyList<AdminOrderSummaryDto>> ListOrdersAsync(
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

    public async Task<AdminOrderDetailDto?> GetOrderDetailAsync(
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

}
