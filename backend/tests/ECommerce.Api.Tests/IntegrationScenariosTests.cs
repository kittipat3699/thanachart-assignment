namespace ECommerce.Api.Tests;

public sealed class IntegrationScenariosTests
{
    [Fact(Skip = "Requires running Supabase test project and seeded tokens.")]
    public void AdminEndpoints_ShouldRejectNonAdminToken()
    {
        // Scenario placeholder:
        // 1) Call GET /api/v1/admin/items with non-admin JWT.
        // 2) Assert 403 Forbidden.
    }

    [Fact(Skip = "Requires concurrent checkout runner against integration database.")]
    public void ConcurrentCheckout_ShouldNotOversellStock()
    {
        // Scenario placeholder:
        // 1) Seed item stock = 1.
        // 2) Execute two checkout requests at the same time.
        // 3) Assert one succeeds and one fails with conflict.
    }
}
