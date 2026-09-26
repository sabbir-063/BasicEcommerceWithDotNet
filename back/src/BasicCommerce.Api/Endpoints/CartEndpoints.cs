using BasicCommerce.Application.Contracts;
using BasicCommerce.Application.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace BasicCommerce.Api.Endpoints;

public static class CartEndpoints
{
    public static void MapCartEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/cart").RequireAuthorization().WithTags("Cart");

        group.MapGet("/", async ([FromServices] ICartService cartService, CancellationToken ct) => 
        {
            return Results.Ok(await cartService.GetCartAsync(ct));
        });

        group.MapPost("/items", async ([FromBody] AddCartRequest req, [FromServices] ICartService cartService, CancellationToken ct) => 
        {
            await cartService.AddToCartAsync(req, ct);
            return Results.Ok(new { message = "Added to cart" });
        });

        group.MapPatch("/items/{id:guid}", async (Guid id, [FromBody] UpdateCartRequest req, [FromServices] ICartService cartService, CancellationToken ct) => 
        {
            await cartService.UpdateCartItemAsync(id, req, ct);
            return Results.Ok(new { message = "Cart updated" });
        });

        group.MapDelete("/items/{id:guid}", async (Guid id, [FromServices] ICartService cartService, CancellationToken ct) => 
        {
            await cartService.RemoveCartItemAsync(id, ct);
            return Results.NoContent();
        });

        group.MapDelete("/", async ([FromServices] ICartService cartService, CancellationToken ct) => 
        {
            await cartService.ClearCartAsync(ct);
            return Results.NoContent();
        });
    }
}
