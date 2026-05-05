using ECommerce.Api.Auth;
using ECommerce.Api.Controllers;
using ECommerce.Api.Extensions;
using ECommerce.Api.Features.Items.Model;
using ECommerce.Api.Features.Items.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Features.Admin.Items.Controller;

[Authorize(Policy = AuthPolicies.AdminOnly)]
[Route("api/v1/admin/items")]
public sealed class AdminItemsController : ApiControllerBase
{
    private readonly IItemService _itemService;

    public AdminItemsController(IItemService itemService)
    {
        _itemService = itemService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<ItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllItems(CancellationToken cancellationToken)
    {
        var items = await _itemService.GetAllItemsAsync(cancellationToken);
        return Ok(items);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ItemDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateItem([FromBody] CreateItemRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var item = await _itemService.CreateItemAsync(request, cancellationToken);
            return CreatedAtAction(nameof(GetItemById), new { id = item.Id }, item);
        }
        catch (Exception exception)
        {
            return MapException(exception);
        }
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetItemById(Guid id, CancellationToken cancellationToken)
    {
        var item = await _itemService.GetItemByIdAsync(id, cancellationToken);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateItem(Guid id, [FromBody] UpdateItemRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var updated = await _itemService.UpdateItemAsync(id, request, cancellationToken);
            return updated is null ? NotFound() : Ok(updated);
        }
        catch (Exception exception)
        {
            return MapException(exception);
        }
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> DeleteItem(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var deleted = await _itemService.DeleteItemAsync(id, cancellationToken);
            return deleted ? NoContent() : NotFound();
        }
        catch (Exception exception)
        {
            return MapException(exception);
        }
    }

    [HttpPost("{id:guid}/adjust-stock")]
    [ProducesResponseType(typeof(ItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> AdjustStock(Guid id, [FromBody] AdjustStockRequest request, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (!userId.HasValue)
        {
            return Unauthorized();
        }

        try
        {
            var item = await _itemService.AdjustStockAsync(id, userId.Value, request, cancellationToken);
            return item is null ? NotFound() : Ok(item);
        }
        catch (Exception exception)
        {
            return MapException(exception);
        }
    }
}
