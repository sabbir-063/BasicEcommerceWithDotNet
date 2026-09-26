using BasicCommerce.Application.DTOs;

namespace BasicCommerce.Application.Contracts;

public interface ICategoryService
{
    Task<IEnumerable<CategoryDto>> GetActiveCategoriesAsync(CancellationToken ct = default);
    Task<IEnumerable<CategoryDto>> GetAdminCategoriesAsync(string? search, CancellationToken ct = default);
    Task<CategoryDto> CreateCategoryAsync(CategoryRequest request, CancellationToken ct = default);
    Task<CategoryDto> UpdateCategoryAsync(Guid id, CategoryRequest request, CancellationToken ct = default);
    Task<CategoryDto> UpdateCategoryStatusAsync(Guid id, StatusRequest request, CancellationToken ct = default);
}
