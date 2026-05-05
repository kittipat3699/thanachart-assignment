using ECommerce.Api.Models;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Controllers;

[ApiController]
public abstract class ApiControllerBase : ControllerBase
{
    protected IActionResult MapException(Exception exception)
    {
        return exception switch
        {
            ValidationException validationException => BadRequest(new { error = validationException.Message }),
            ConflictException conflictException => Conflict(new { error = conflictException.Message }),
            _ => Problem(title: "Unexpected error", detail: exception.Message, statusCode: StatusCodes.Status500InternalServerError)
        };
    }
}
