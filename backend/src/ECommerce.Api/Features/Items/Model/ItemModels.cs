using System.ComponentModel.DataAnnotations;

namespace ECommerce.Api.Features.Items.Model;

public sealed class ItemDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Sku { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public decimal Price { get; init; }
    public int Stock { get; init; }
    public string? ImageUrl { get; init; }
    public bool IsActive { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
    public DateTimeOffset UpdatedAt { get; init; }
}

public sealed class CreateItemRequest
{
    [Required]
    [StringLength(160, MinimumLength = 2)]
    public string Name { get; init; } = string.Empty;

    [Required]
    [StringLength(64, MinimumLength = 2)]
    public string Sku { get; init; } = string.Empty;

    [StringLength(2000)]
    public string Description { get; init; } = string.Empty;

    [Range(0.01, 1_000_000)]
    public decimal Price { get; init; }

    [Range(0, 1_000_000)]
    public int Stock { get; init; }

    [Url]
    public string? ImageUrl { get; init; }

    public bool IsActive { get; init; } = true;
}

public sealed class UpdateItemRequest
{
    [Required]
    [StringLength(160, MinimumLength = 2)]
    public string Name { get; init; } = string.Empty;

    [Required]
    [StringLength(64, MinimumLength = 2)]
    public string Sku { get; init; } = string.Empty;

    [StringLength(2000)]
    public string Description { get; init; } = string.Empty;

    [Range(0.01, 1_000_000)]
    public decimal Price { get; init; }

    [Range(0, 1_000_000)]
    public int Stock { get; init; }

    [Url]
    public string? ImageUrl { get; init; }

    public bool IsActive { get; init; } = true;
}

public sealed class AdjustStockRequest
{
    [Range(-1_000_000, 1_000_000)]
    public int Delta { get; init; }

    [Required]
    [StringLength(300, MinimumLength = 3)]
    public string Reason { get; init; } = string.Empty;
}
