using BasicCommerce.Application.DTOs;

namespace BasicCommerce.Application.Contracts;

public interface IOrderService
{
    Task<OrderDto> CheckoutAsync(CheckoutRequest request, CancellationToken ct = default);
    Task<OrderListResponse> GetMyOrdersAsync(int? page, int? pageSize, CancellationToken ct = default);
    Task<OrderDto> GetMyOrderAsync(Guid id, CancellationToken ct = default);
    Task<OrderDto> CancelMyOrderAsync(Guid id, CancellationToken ct = default);
    
    Task<OrderListResponse> GetAdminOrdersAsync(int? page, int? pageSize, string? status, string? search, CancellationToken ct = default);
    Task<OrderDto> GetAdminOrderAsync(Guid id, CancellationToken ct = default);
    Task<OrderDto> UpdateOrderStatusAsync(Guid id, StatusValueRequest request, CancellationToken ct = default);
    
    Task<DashboardSummary> GetDashboardSummaryAsync(CancellationToken ct = default);
}
