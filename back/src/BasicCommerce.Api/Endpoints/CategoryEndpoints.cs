using BasicCommerce.Application.Contracts;
using BasicCommerce.Application.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace BasicCommerce.Api.Endpoints;

public static class CategoryEndpoints
{
    public static void MapCategoryEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/categories", async ([FromServices] ICategoryService categoryService, CancellationToken ct) => 
        {
            return Results.Ok(await categoryService.GetActiveCategoriesAsync(ct));
        }).WithTags("Categories");

        var adminGroup = app.MapGroup("/api/admin/categories").RequireAuthorization("Admin").WithTags("Admin Categories");

        adminGroup.MapGet("/", async (string? search, [FromServices] ICategoryService categoryService, CancellationToken ct) => 
        {
            return Results.Ok(await categoryService.GetAdminCategoriesAsync(search, ct));
        });

        adminGroup.MapPost("/", async ([FromBody] CategoryRequest req, [FromServices] ICategoryService categoryService, CancellationToken ct) => 
        {
            var c = await categoryService.CreateCategoryAsync(req, ct);
            return Results.Created($"/api/admin/categories/{c.Id}", c);
        });

        adminGroup.MapPut("/{id:guid}", async (Guid id, [FromBody] CategoryRequest req, [FromServices] ICategoryService categoryService, CancellationToken ct) => 
        {
            return Results.Ok(await categoryService.UpdateCategoryAsync(id, req, ct));
        });

        adminGroup.MapPatch("/{id:guid}/status", async (Guid id, [FromBody] StatusRequest req, [FromServices] ICategoryService categoryService, CancellationToken ct) => 
        {
            return Results.Ok(await categoryService.UpdateCategoryStatusAsync(id, req, ct));
        });
    }
}
