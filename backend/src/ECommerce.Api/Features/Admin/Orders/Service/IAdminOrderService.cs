using ECommerce.Api.Features.Orders.Model;

namespace ECommerce.Api.Features.Admin.Orders.Service;

public interface IAdminOrderService
{
    Task<IReadOnlyList<AdminOrderSummaryDto>> ListOrdersAsync(CancellationToken cancellationToken = default);

    Task<AdminOrderDetailDto?> GetOrderDetailAsync(Guid orderId, CancellationToken cancellationToken = default);
}
