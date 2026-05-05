using System.ComponentModel.DataAnnotations;

namespace ECommerce.Api.Models;

public sealed class SupabaseOptions
{
    public const string SectionName = "Supabase";

    [Required]
    public string Url { get; init; } = string.Empty;

    [Required]
    public string DbConnectionString { get; init; } = string.Empty;

    [Required]
    public string AnonKey { get; init; } = string.Empty;

    [Required]
    public string ServiceRoleKey { get; init; } = string.Empty;

    public string JwtAudience { get; init; } = "authenticated";
}
