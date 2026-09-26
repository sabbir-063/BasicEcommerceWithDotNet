namespace BasicCommerce.Application.DTOs;

public record CartItemDto(Guid Id, Guid ProductId, string ProductName, string? ImageUrl, decimal UnitPrice, int Quantity, int AvailableStock, decimal LineTotal);
public record CartDto(Guid Id, IEnumerable<CartItemDto> Items, int ItemCount, decimal TotalAmount);
public record AddCartRequest(Guid ProductId, int Quantity);
public record UpdateCartRequest(int Quantity);
