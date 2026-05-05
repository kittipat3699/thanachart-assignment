using System.Security.Claims;

namespace ECommerce.Api.Extensions;

public static class UserClaimsExtensions
{
    public static Guid? GetUserId(this ClaimsPrincipal user)
    {
        var subject = user.FindFirstValue("sub") ?? user.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(subject, out var userId) ? userId : null;
    }
}
