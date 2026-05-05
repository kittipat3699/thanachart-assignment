using ECommerce.Api.Models;
using ECommerce.Api.Features.Items.Service;
using FluentAssertions;

namespace ECommerce.Api.Tests;

public sealed class StockPolicyTests
{
    [Fact]
    public void CalculateAdjustedStock_ShouldDecreaseStock_WhenEnoughStockExists()
    {
        var result = StockPolicy.CalculateAdjustedStock(10, -3);
        result.Should().Be(7);
    }

    [Fact]
    public void CalculateAdjustedStock_ShouldThrowConflict_WhenNegativeStockWouldOccur()
    {
        var action = () => StockPolicy.CalculateAdjustedStock(2, -3);
        action.Should().Throw<ConflictException>().WithMessage("*Stock cannot be negative*");
    }

    [Fact]
    public void CalculateLineTotal_ShouldRoundToTwoDecimals()
    {
        var result = StockPolicy.CalculateLineTotal(10.125m, 3);
        result.Should().Be(30.38m);
    }
}
