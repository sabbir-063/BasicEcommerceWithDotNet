using BasicCommerce.Domain;

namespace BasicCommerce.Application.DTOs;

public record OrderItemDto(Guid Id, Guid ProductId, string ProductName, decimal UnitPrice, int Quantity, decimal LineTotal);
public record OrderDto(Guid Id, string OrderNumber, string CustomerName, string Phone, string ShippingAddress, string Status, string PaymentMethod, decimal TotalAmount, DateTimeOffset CreatedAt, IEnumerable<OrderItemDto> Items);
public record OrderSummaryDto(Guid Id, string OrderNumber, string CustomerName, string Status, decimal TotalAmount, int ItemCount, DateTimeOffset CreatedAt);
public record OrderListResponse(IEnumerable<OrderSummaryDto> Items, int Page, int PageSize, int TotalItems, int TotalPages);
public record CheckoutRequest(string CustomerName, string Phone, string ShippingAddress, PaymentMethod PaymentMethod);
public record StatusValueRequest(string Status);
public record DashboardSummary(int TotalProducts, int ActiveProducts, int TotalOrders, int PendingOrders, int TotalCustomers);
