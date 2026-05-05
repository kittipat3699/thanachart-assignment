using ECommerce.Api.Controllers;
using ECommerce.Api.Features.Orders.Model;
using ECommerce.Api.Features.Orders.Service;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Features.Orders.Controller;

[Route("api/v1/orders")]
public sealed class OrdersController : ApiControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpPost]
    [ProducesResponseType(typeof(CheckoutResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Checkout([FromBody] CheckoutRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var response = await _orderService.CheckoutAsync(request, cancellationToken);
            return Ok(response);
        }
        catch (Exception exception)
        {
            return MapException(exception);
        }
    }
}
