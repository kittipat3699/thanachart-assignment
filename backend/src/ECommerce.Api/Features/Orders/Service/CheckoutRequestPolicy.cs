using ECommerce.Api.Features.Orders.Model;
using ECommerce.Api.Models;

namespace ECommerce.Api.Features.Orders.Service;

public static class CheckoutRequestPolicy
{
    public static void Validate(CheckoutRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.CustomerName))
        {
            throw new ValidationException("Customer name is required.");
        }

        if (string.IsNullOrWhiteSpace(request.CustomerEmail))
        {
            throw new ValidationException("Customer email is required.");
        }

        if (request.Items.Count == 0)
        {
            throw new ValidationException("Checkout items are required.");
        }

        if (request.Items.Any(item => item.Quantity <= 0))
        {
            throw new ValidationException("Quantity must be greater than zero.");
        }

        if (request.Items.Any(item => item.ItemId == Guid.Empty))
        {
            throw new ValidationException("Item id is required.");
        }
    }

    public static IReadOnlyList<CheckoutLineRequest> NormalizeLines(IReadOnlyList<CheckoutLineRequest> lines)
    {
        return lines
            .GroupBy(line => line.ItemId)
            .Select(group => new CheckoutLineRequest
            {
                ItemId = group.Key,
                Quantity = group.Sum(item => item.Quantity)
            })
            .ToList();
    }
}
