using ECommerce.Api.Features.Orders.Model;
using ECommerce.Api.Features.Orders.Service;
using ECommerce.Api.Models;
using FluentAssertions;

namespace ECommerce.Api.Tests;

public sealed class CheckoutRequestPolicyTests
{
    [Fact]
    public void Validate_ShouldThrow_WhenItemsAreEmpty()
    {
        var request = new CheckoutRequest
        {
            CustomerName = "Guest",
            CustomerEmail = "guest@example.com",
            Items = []
        };

        var action = () => CheckoutRequestPolicy.Validate(request);
        action.Should().Throw<ValidationException>().WithMessage("*Checkout items are required*");
    }

    [Fact]
    public void NormalizeLines_ShouldMergeDuplicateItems()
    {
        var itemId = Guid.NewGuid();
        var lines = new List<CheckoutLineRequest>
        {
            new() { ItemId = itemId, Quantity = 1 },
            new() { ItemId = itemId, Quantity = 2 }
        };

        var normalized = CheckoutRequestPolicy.NormalizeLines(lines);

        normalized.Should().HaveCount(1);
        normalized[0].ItemId.Should().Be(itemId);
        normalized[0].Quantity.Should().Be(3);
    }
}
