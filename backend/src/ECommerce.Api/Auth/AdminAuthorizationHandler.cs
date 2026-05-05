using System.Security.Claims;
using ECommerce.Api.Auth.Service;
using Microsoft.AspNetCore.Authorization;

namespace ECommerce.Api.Auth;

public sealed class AdminAuthorizationHandler : AuthorizationHandler<AdminRequirement>
{
    private readonly IAdminAuthorizationService _adminAuthorizationService;

    public AdminAuthorizationHandler(IAdminAuthorizationService adminAuthorizationService)
    {
        _adminAuthorizationService = adminAuthorizationService;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        AdminRequirement requirement)
    {
        var subject = context.User.FindFirstValue("sub")
            ?? context.User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(subject, out var userId))
        {
            return;
        }

        var isActiveAdmin = await _adminAuthorizationService.IsActiveAdminAsync(userId);
        if (isActiveAdmin)
        {
            context.Succeed(requirement);
        }
    }
}
