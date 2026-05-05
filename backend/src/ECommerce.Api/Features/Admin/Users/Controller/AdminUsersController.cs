using ECommerce.Api.Auth;
using ECommerce.Api.Controllers;
using ECommerce.Api.Features.Admin.Users.Model;
using ECommerce.Api.Features.Admin.Users.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Features.Admin.Users.Controller;

[Authorize(Policy = AuthPolicies.AdminOnly)]
[Route("api/v1/admin/users")]
public sealed class AdminUsersController : ApiControllerBase
{
    private readonly IAdminUserService _adminUserService;

    public AdminUsersController(IAdminUserService adminUserService)
    {
        _adminUserService = adminUserService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<AdminUserDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAdminUsers(CancellationToken cancellationToken)
    {
        var users = await _adminUserService.GetAdminUsersAsync(cancellationToken);
        return Ok(users);
    }

    [HttpPost]
    [ProducesResponseType(typeof(AdminUserDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateAdminUser([FromBody] CreateAdminUserRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var user = await _adminUserService.CreateAdminUserAsync(request, cancellationToken);
            return CreatedAtAction(nameof(GetAdminUsers), new { id = user.UserId }, user);
        }
        catch (Exception exception)
        {
            return MapException(exception);
        }
    }

    [HttpPatch("{id:guid}")]
    [ProducesResponseType(typeof(AdminUserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateAdminUser(Guid id, [FromBody] UpdateAdminUserRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var user = await _adminUserService.UpdateAdminUserAsync(id, request, cancellationToken);
            return user is null ? NotFound() : Ok(user);
        }
        catch (Exception exception)
        {
            return MapException(exception);
        }
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteAdminUser(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await _adminUserService.DeleteAdminUserAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}
