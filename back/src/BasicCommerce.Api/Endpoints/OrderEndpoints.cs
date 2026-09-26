using BasicCommerce.Application.Contracts;
using BasicCommerce.Application.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace BasicCommerce.Api.Endpoints;

public static class OrderEndpoints
{
    public static void MapOrderEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/orders").RequireAuthorization().WithTags("Orders");

        group.MapPost("/", async ([FromBody] CheckoutRequest req, [FromServices] IOrderService orderService, CancellationToken ct) => 
        {
            var o = await orderService.CheckoutAsync(req, ct);
            return Results.Created($"/api/orders/{o.Id}", o);
        });

        group.MapGet("/", async (int? page, int? pageSize, [FromServices] IOrderService orderService, CancellationToken ct) => 
        {
            return Results.Ok(await orderService.GetMyOrdersAsync(page, pageSize, ct));
        });

        group.MapGet("/{id:guid}", async (Guid id, [FromServices] IOrderService orderService, CancellationToken ct) => 
        {
            return Results.Ok(await orderService.GetMyOrderAsync(id, ct));
        });

        group.MapPost("/{id:guid}/cancel", async (Guid id, [FromServices] IOrderService orderService, CancellationToken ct) => 
        {
            return Results.Ok(await orderService.CancelMyOrderAsync(id, ct));
        });

        var adminGroup = app.MapGroup("/api/admin/orders").RequireAuthorization("Admin").WithTags("Admin Orders");

        adminGroup.MapGet("/", async (int? page, int? pageSize, string? status, string? search, [FromServices] IOrderService orderService, CancellationToken ct) => 
        {
            return Results.Ok(await orderService.GetAdminOrdersAsync(page, pageSize, status, search, ct));
        });

        adminGroup.MapGet("/{id:guid}", async (Guid id, [FromServices] IOrderService orderService, CancellationToken ct) => 
        {
            return Results.Ok(await orderService.GetAdminOrderAsync(id, ct));
        });

        adminGroup.MapPatch("/{id:guid}/status", async (Guid id, [FromBody] StatusValueRequest req, [FromServices] IOrderService orderService, CancellationToken ct) => 
        {
            return Results.Ok(await orderService.UpdateOrderStatusAsync(id, req, ct));
        });
        
        var dashboardGroup = app.MapGroup("/api/admin/dashboard").RequireAuthorization("Admin").WithTags("Admin Dashboard");

        dashboardGroup.MapGet("/summary", async ([FromServices] IOrderService orderService, CancellationToken ct) => 
        {
            return Results.Ok(await orderService.GetDashboardSummaryAsync(ct));
        });
    }
}
