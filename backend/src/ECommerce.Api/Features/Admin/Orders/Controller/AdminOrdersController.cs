using ECommerce.Api.Auth;
using ECommerce.Api.Controllers;
using ECommerce.Api.Features.Orders.Model;
using ECommerce.Api.Features.Orders.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Features.Admin.Orders.Controller;

[Authorize(Policy = AuthPolicies.AdminOnly)]
[Route("api/v1/admin/orders")]
public sealed class AdminOrdersController : ApiControllerBase
{
    private readonly IOrderService _orderService;

    public AdminOrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<AdminOrderSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ListOrders(CancellationToken cancellationToken)
    {
        var orders = await _orderService.ListOrdersForAdminAsync(cancellationToken);
        return Ok(orders);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(AdminOrderDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOrder(Guid id, CancellationToken cancellationToken)
    {
        var order = await _orderService.GetOrderDetailForAdminAsync(id, cancellationToken);
        if (order is null)
        {
            return NotFound();
        }

        return Ok(order);
    }
}
