namespace BasicCommerce.Application.DTOs;

public record ProductDto(Guid Id, Guid CategoryId, string? CategoryName, string Name, string Slug, string? Description, decimal Price, int StockQuantity, string? ImageUrl, string? ImageAltText, bool IsActive);
public record ProductListResponse(IEnumerable<ProductDto> Items, int Page, int PageSize, int TotalItems, int TotalPages);
public record ProductRequest(Guid CategoryId, string Name, string? Description, decimal Price, int StockQuantity, string? ImageUrl, string? ImagePublicId, string? ImageAltText, bool IsActive = true);
public record StockRequest(int StockQuantity);
