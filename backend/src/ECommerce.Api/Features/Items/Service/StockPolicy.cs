using ECommerce.Api.Models;

namespace ECommerce.Api.Features.Items.Service;

public static class StockPolicy
{
    public static int CalculateAdjustedStock(int currentStock, int delta)
    {
        var nextStock = currentStock + delta;
        if (nextStock < 0)
        {
            throw new ConflictException("Stock cannot be negative.");
        }

        return nextStock;
    }

    public static decimal CalculateLineTotal(decimal unitPrice, int quantity)
    {
        if (quantity <= 0)
        {
            throw new ValidationException("Quantity must be greater than zero.");
        }

        return decimal.Round(unitPrice * quantity, 2, MidpointRounding.AwayFromZero);
    }
}
