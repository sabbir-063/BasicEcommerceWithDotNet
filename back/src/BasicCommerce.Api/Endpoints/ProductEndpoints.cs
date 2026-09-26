using BasicCommerce.Application.Contracts;
using BasicCommerce.Application.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace BasicCommerce.Api.Endpoints;

public static class ProductEndpoints
{
    public static void MapProductEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/products", async (int? page, int? pageSize, string? search, Guid? categoryId, string? sort, [FromServices] IProductService productService, CancellationToken ct) => 
        {
            return Results.Ok(await productService.GetProductsAsync(page, pageSize, search, categoryId, sort, ct));
        }).WithTags("Products");

        app.MapGet("/api/products/{idOrSlug}", async (string idOrSlug, [FromServices] IProductService productService, CancellationToken ct) => 
        {
            return Results.Ok(await productService.GetProductAsync(idOrSlug, ct));
        }).WithTags("Products");

        var adminGroup = app.MapGroup("/api/admin/products").RequireAuthorization("Admin").WithTags("Admin Products");

        adminGroup.MapGet("/", async (int? page, int? pageSize, string? search, Guid? categoryId, string? sort, [FromServices] IProductService productService, CancellationToken ct) => 
        {
            return Results.Ok(await productService.GetAdminProductsAsync(page, pageSize, search, categoryId, sort, ct));
        });

        adminGroup.MapGet("/{id:guid}", async (Guid id, [FromServices] IProductService productService, CancellationToken ct) => 
        {
            return Results.Ok(await productService.GetAdminProductAsync(id, ct));
        });

        adminGroup.MapPost("/", async ([FromBody] ProductRequest req, [FromServices] IProductService productService, CancellationToken ct) => 
        {
            var p = await productService.CreateProductAsync(req, ct);
            return Results.Created($"/api/admin/products/{p.Id}", p);
        });

        adminGroup.MapPut("/{id:guid}", async (Guid id, [FromBody] ProductRequest req, [FromServices] IProductService productService, CancellationToken ct) => 
        {
            return Results.Ok(await productService.UpdateProductAsync(id, req, ct));
        });

        adminGroup.MapPatch("/{id:guid}/stock", async (Guid id, [FromBody] StockRequest req, [FromServices] IProductService productService, CancellationToken ct) => 
        {
            return Results.Ok(await productService.UpdateProductStockAsync(id, req, ct));
        });

        adminGroup.MapPatch("/{id:guid}/status", async (Guid id, [FromBody] StatusRequest req, [FromServices] IProductService productService, CancellationToken ct) => 
        {
            return Results.Ok(await productService.UpdateProductStatusAsync(id, req, ct));
        });
        
        adminGroup.MapDelete("/{id:guid}", async (Guid id, [FromServices] IProductService productService, CancellationToken ct) => 
        {
            await productService.DeleteProductAsync(id, ct);
            return Results.NoContent();
        });
    }
}
