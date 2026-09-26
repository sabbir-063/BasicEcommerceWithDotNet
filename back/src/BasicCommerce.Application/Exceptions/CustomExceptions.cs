namespace BasicCommerce.Application.Exceptions;

public abstract class BaseApplicationException : Exception
{
    public string Code { get; }
    public string Title { get; }

    protected BaseApplicationException(string message, string title, string code) : base(message)
    {
        Title = title;
        Code = code;
    }
}

public class ValidationException : BaseApplicationException
{
    public ValidationException(string message) : base(message, "Validation error", "VALIDATION_ERROR") { }
    public ValidationException(string message, string code) : base(message, "Validation error", code) { }
}

public class NotFoundException : BaseApplicationException
{
    public NotFoundException(string message) : base(message, "Not found", "NOT_FOUND") { }
}

public class ConflictException : BaseApplicationException
{
    public ConflictException(string message, string code = "CONCURRENCY_CONFLICT") : base(message, "Conflict", code) { }
}

public class UnauthorizedException : BaseApplicationException
{
    public UnauthorizedException(string message, string code = "INVALID_CREDENTIALS") : base(message, "Unauthorized", code) { }
}
