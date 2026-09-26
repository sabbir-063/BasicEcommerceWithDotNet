using BasicCommerce.Application.DTOs;

namespace BasicCommerce.Application.Contracts;

public interface ICartService
{
    Task<CartDto> GetCartAsync(CancellationToken ct = default);
    Task AddToCartAsync(AddCartRequest request, CancellationToken ct = default);
    Task UpdateCartItemAsync(Guid itemId, UpdateCartRequest request, CancellationToken ct = default);
    Task RemoveCartItemAsync(Guid itemId, CancellationToken ct = default);
    Task ClearCartAsync(CancellationToken ct = default);
}
