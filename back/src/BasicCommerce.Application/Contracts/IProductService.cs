using BasicCommerce.Application.DTOs;

namespace BasicCommerce.Application.Contracts;

public interface IProductService
{
    Task<ProductListResponse> GetProductsAsync(int? page, int? pageSize, string? search, Guid? categoryId, string? sort, CancellationToken ct = default);
    Task<ProductDto> GetProductAsync(string idOrSlug, CancellationToken ct = default);
    Task<ProductListResponse> GetAdminProductsAsync(int? page, int? pageSize, string? search, Guid? categoryId, string? sort, CancellationToken ct = default);
    Task<ProductDto> GetAdminProductAsync(Guid id, CancellationToken ct = default);
    Task<ProductDto> CreateProductAsync(ProductRequest request, CancellationToken ct = default);
    Task<ProductDto> UpdateProductAsync(Guid id, ProductRequest request, CancellationToken ct = default);
    Task<ProductDto> UpdateProductStockAsync(Guid id, StockRequest request, CancellationToken ct = default);
    Task<ProductDto> UpdateProductStatusAsync(Guid id, StatusRequest request, CancellationToken ct = default);
    Task DeleteProductAsync(Guid id, CancellationToken ct = default);
}
