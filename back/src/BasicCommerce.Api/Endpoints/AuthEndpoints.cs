using BasicCommerce.Application.Contracts;
using BasicCommerce.Application.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace BasicCommerce.Api.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Auth");

        group.MapPost("/register", async ([FromBody] RegisterRequest req, [FromServices] IAuthService authService, CancellationToken ct) =>
        {
            var user = await authService.RegisterAsync(req, ct);
            return Results.Created("/api/auth/me", user);
        });

        group.MapPost("/login", async ([FromBody] LoginRequest req, [FromServices] IAuthService authService, CancellationToken ct) =>
        {
            var response = await authService.LoginAsync(req, ct);
            return Results.Ok(new
            {
                accessToken = response.AccessToken,
                expiresAt = response.ExpiresAt,
                user = response.User
            });
        });

        var authorizedGroup = group.MapGroup("").RequireAuthorization();

        authorizedGroup.MapGet("/me", async ([FromServices] ICurrentUserService currentUserService, [FromServices] IAuthService authService, CancellationToken ct) =>
        {
            var userId = currentUserService.GetUserId();
            var profile = await authService.GetProfileAsync(userId, ct);
            return Results.Ok(profile);
        });

        authorizedGroup.MapPut("/profile", async ([FromBody] ProfileRequest req, [FromServices] ICurrentUserService currentUserService, [FromServices] IAuthService authService, CancellationToken ct) =>
        {
            var userId = currentUserService.GetUserId();
            var profile = await authService.UpdateProfileAsync(userId, req, ct);
            return Results.Ok(profile);
        });

        authorizedGroup.MapPost("/change-password", async ([FromBody] ChangePasswordRequest req, [FromServices] ICurrentUserService currentUserService, [FromServices] IAuthService authService, CancellationToken ct) =>
        {
            var userId = currentUserService.GetUserId();
            await authService.ChangePasswordAsync(userId, req, ct);
            return Results.NoContent();
        });
    }
}
