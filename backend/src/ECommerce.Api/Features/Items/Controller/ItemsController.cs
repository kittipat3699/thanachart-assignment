using ECommerce.Api.Controllers;
using ECommerce.Api.Features.Items.Model;
using ECommerce.Api.Features.Items.Service;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Features.Items.Controller;

[Route("api/v1/items")]
public sealed class ItemsController : ApiControllerBase
{
    private readonly IItemService _itemService;

    public ItemsController(IItemService itemService)
    {
        _itemService = itemService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<ItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetItems(CancellationToken cancellationToken)
    {
        var items = await _itemService.GetActiveItemsAsync(cancellationToken);
        return Ok(items);
    }
}
