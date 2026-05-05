using ECommerce.Api.Features.Items.Model;

namespace ECommerce.Api.Features.Items.Service;

public interface IItemService
{
    Task<IReadOnlyList<ItemDto>> GetActiveItemsAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ItemDto>> GetAllItemsAsync(CancellationToken cancellationToken = default);
    Task<ItemDto?> GetItemByIdAsync(Guid itemId, CancellationToken cancellationToken = default);
    Task<ItemDto> CreateItemAsync(CreateItemRequest request, CancellationToken cancellationToken = default);
    Task<ItemDto?> UpdateItemAsync(Guid itemId, UpdateItemRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteItemAsync(Guid itemId, CancellationToken cancellationToken = default);
    Task<ItemDto?> AdjustStockAsync(Guid itemId, Guid adjustedBy, AdjustStockRequest request, CancellationToken cancellationToken = default);
}
