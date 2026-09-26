using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Npgsql;

public sealed class ConcurrencyExceptionHandler(ILogger<ConcurrencyExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var databaseError = exception as PostgresException
            ?? exception.InnerException as PostgresException;
        var isConflict = exception is DbUpdateConcurrencyException ||
            databaseError?.SqlState is PostgresErrorCodes.SerializationFailure or
                PostgresErrorCodes.DeadlockDetected or PostgresErrorCodes.UniqueViolation;
        if (!isConflict) return false;

        logger.LogWarning(exception, "A database conflict occurred for {RequestPath}", httpContext.Request.Path);
        await Results.Problem(
            statusCode: StatusCodes.Status409Conflict,
            title: "Concurrent change",
            detail: "The resource changed while processing this request. Refresh and try again.",
            extensions: new Dictionary<string, object?>
            {
                ["code"] = "CONCURRENCY_CONFLICT",
                ["traceId"] = httpContext.TraceIdentifier
            }).ExecuteAsync(httpContext);
        return true;
    }
}
