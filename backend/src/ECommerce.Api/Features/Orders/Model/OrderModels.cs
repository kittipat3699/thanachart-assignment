using System.ComponentModel.DataAnnotations;

namespace ECommerce.Api.Features.Orders.Model;

public sealed class CheckoutRequest
{
    [Required]
    [StringLength(120, MinimumLength = 2)]
    public string CustomerName { get; init; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(200)]
    public string CustomerEmail { get; init; } = string.Empty;

    [StringLength(30)]
    public string? CustomerPhone { get; init; }

    [Required]
    [MinLength(1)]
    public IReadOnlyList<CheckoutLineRequest> Items { get; init; } = [];
}

public sealed class CheckoutLineRequest
{
    [Required]
    public Guid ItemId { get; init; }

    [Range(1, 1_000)]
    public int Quantity { get; init; }
}

public sealed class CheckoutItemSummary
{
    public Guid ItemId { get; init; }
    public string Name { get; init; } = string.Empty;
    public int Quantity { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal LineTotal { get; init; }
}

public sealed class CheckoutResponse
{
    public Guid OrderId { get; init; }
    public decimal TotalAmount { get; init; }
    public string Currency { get; init; } = "THB";
    public DateTimeOffset CreatedAt { get; init; }
    public IReadOnlyList<CheckoutItemSummary> Items { get; init; } = [];
}

public sealed class AdminOrderSummaryDto
{
    public Guid Id { get; init; }
    public string CustomerName { get; init; } = string.Empty;
    public string CustomerEmail { get; init; } = string.Empty;
    public string? CustomerPhone { get; init; }
    public decimal TotalAmount { get; init; }
    public string Currency { get; init; } = "THB";
    public string Status { get; init; } = string.Empty;
    public DateTimeOffset CreatedAt { get; init; }
    public int LineCount { get; init; }
}

public sealed class AdminOrderLineDto
{
    public Guid ItemId { get; init; }
    public string Name { get; init; } = string.Empty;
    public int Quantity { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal LineTotal { get; init; }
}

public sealed class AdminOrderDetailDto
{
    public Guid Id { get; init; }
    public string CustomerName { get; init; } = string.Empty;
    public string CustomerEmail { get; init; } = string.Empty;
    public string? CustomerPhone { get; init; }
    public decimal TotalAmount { get; init; }
    public string Currency { get; init; } = "THB";
    public string Status { get; init; } = string.Empty;
    public DateTimeOffset CreatedAt { get; init; }
    public DateTimeOffset UpdatedAt { get; init; }
    public IReadOnlyList<AdminOrderLineDto> Items { get; init; } = [];
}
