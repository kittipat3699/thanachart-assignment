using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using ECommerce.Api.Models;
using Microsoft.Extensions.Options;

namespace ECommerce.Api.Features.Admin.Users.Service;

public sealed class SupabaseAuthAdminClient : ISupabaseAuthAdminClient
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    private readonly HttpClient _httpClient;
    private readonly SupabaseOptions _options;

    public SupabaseAuthAdminClient(HttpClient httpClient, IOptions<SupabaseOptions> options)
    {
        _httpClient = httpClient;
        _options = options.Value;

        _httpClient.BaseAddress = new Uri(_options.Url.TrimEnd('/'));
    }

    public async Task<Guid> CreateUserAsync(string email, string password, bool emailConfirmed, CancellationToken cancellationToken = default)
    {
        var payload = JsonSerializer.Serialize(new
        {
            email,
            password,
            email_confirm = emailConfirmed
        }, JsonOptions);

        using var request = CreateRequest(HttpMethod.Post, "/auth/v1/admin/users", payload);
        using var response = await _httpClient.SendAsync(request, cancellationToken);

        var content = await response.Content.ReadAsStringAsync(cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            throw BuildException(response.StatusCode, content);
        }

        using var document = JsonDocument.Parse(content);
        if (!document.RootElement.TryGetProperty("id", out var idElement)
            || !Guid.TryParse(idElement.GetString(), out var userId))
        {
            throw new ValidationException("Could not parse user id from Supabase response.");
        }

        return userId;
    }

    public async Task<bool> DeleteUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        using var request = CreateRequest(HttpMethod.Delete, $"/auth/v1/admin/users/{userId}");
        using var response = await _httpClient.SendAsync(request, cancellationToken);

        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            return false;
        }

        if (!response.IsSuccessStatusCode)
        {
            var content = await response.Content.ReadAsStringAsync(cancellationToken);
            throw BuildException(response.StatusCode, content);
        }

        return true;
    }

    private HttpRequestMessage CreateRequest(HttpMethod method, string path, string? payload = null)
    {
        var request = new HttpRequestMessage(method, path);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _options.ServiceRoleKey);
        request.Headers.Add("apikey", _options.ServiceRoleKey);

        if (payload is not null)
        {
            request.Content = new StringContent(payload, Encoding.UTF8, "application/json");
        }

        return request;
    }

    private static Exception BuildException(HttpStatusCode statusCode, string content)
    {
        if (statusCode == HttpStatusCode.Conflict)
        {
            return new ConflictException($"Supabase rejected request: {content}");
        }

        if (statusCode is HttpStatusCode.BadRequest or HttpStatusCode.UnprocessableEntity)
        {
            return new ValidationException($"Supabase rejected request: {content}");
        }

        return new Exception($"Supabase request failed: {(int)statusCode} {statusCode} - {content}");
    }
}
