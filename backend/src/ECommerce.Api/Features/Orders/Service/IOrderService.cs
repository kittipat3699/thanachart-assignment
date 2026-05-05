using ECommerce.Api.Features.Orders.Model;

namespace ECommerce.Api.Features.Orders.Service;

public interface IOrderService
{
    Task<CheckoutResponse> CheckoutAsync(CheckoutRequest request, CancellationToken cancellationToken = default);
}
