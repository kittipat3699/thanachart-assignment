using ECommerce.Api.Auth;
using ECommerce.Api.Controllers;
using ECommerce.Api.Features.Admin.Orders.Service;
using ECommerce.Api.Features.Orders.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Features.Admin.Orders.Controller;

[Authorize(Policy = AuthPolicies.AdminOnly)]
[Route("api/v1/admin/orders")]
public sealed class AdminOrdersController : ApiControllerBase
{
    private readonly IAdminOrderService _orderService;

    public AdminOrdersController(IAdminOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<AdminOrderSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ListOrders(CancellationToken cancellationToken)
    {
        var orders = await _orderService.ListOrdersAsync(cancellationToken);
        return Ok(orders);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(AdminOrderDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOrder(Guid id, CancellationToken cancellationToken)
    {
        var order = await _orderService.GetOrderDetailAsync(id, cancellationToken);
        if (order is null)
        {
            return NotFound();
        }

        return Ok(order);
    }
}
