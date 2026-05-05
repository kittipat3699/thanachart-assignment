namespace ECommerce.Api.Models;

public sealed class ValidationException : Exception
{
    public ValidationException(string message) : base(message)
    {
    }
}

public sealed class ConflictException : Exception
{
    public ConflictException(string message) : base(message)
    {
    }
}
