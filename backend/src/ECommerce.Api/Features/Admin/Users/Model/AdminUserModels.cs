using System.ComponentModel.DataAnnotations;

namespace ECommerce.Api.Features.Admin.Users.Model;

public sealed class AdminUserDto
{
    public Guid UserId { get; init; }
    public string Email { get; init; } = string.Empty;
    public string? DisplayName { get; init; }
    public bool IsActive { get; init; }
    public string Role { get; init; } = "admin";
    public DateTimeOffset CreatedAt { get; init; }
}

public sealed class CreateAdminUserRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; init; } = string.Empty;

    [Required]
    [StringLength(128, MinimumLength = 8)]
    public string Password { get; init; } = string.Empty;

    [StringLength(120)]
    public string? DisplayName { get; init; }

    public bool EmailConfirmed { get; init; } = true;
}

public sealed class UpdateAdminUserRequest
{
    [StringLength(120)]
    public string? DisplayName { get; init; }

    public bool? IsActive { get; init; }
}
