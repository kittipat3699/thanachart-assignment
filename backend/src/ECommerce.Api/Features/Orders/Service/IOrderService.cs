using ECommerce.Api.Features.Orders.Model;

namespace ECommerce.Api.Features.Orders.Service;

public interface IOrderService
{
    Task<CheckoutResponse> CheckoutAsync(CheckoutRequest request, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<AdminOrderSummaryDto>> ListOrdersForAdminAsync(CancellationToken cancellationToken = default);

    Task<AdminOrderDetailDto?> GetOrderDetailForAdminAsync(Guid orderId, CancellationToken cancellationToken = default);
}
