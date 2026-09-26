using BasicCommerce.Application.Contracts;
using BasicCommerce.Application.DTOs;
using BasicCommerce.Application.Exceptions;
using BasicCommerce.Domain;
using Microsoft.EntityFrameworkCore;

namespace BasicCommerce.Application.Services;

public class CategoryService : ICategoryService
{
    private readonly IAppDbContext _db;

    public CategoryService(IAppDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<CategoryDto>> GetActiveCategoriesAsync(CancellationToken ct = default)
    {
        return await _db.Categories
            .AsNoTracking()
            .Where(x => x.IsActive)
            .OrderBy(x => x.Name)
            .Select(c => new CategoryDto(c.Id, c.Name, c.Slug, c.IsActive))
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<CategoryDto>> GetAdminCategoriesAsync(string? search, CancellationToken ct = default)
    {
        return await _db.Categories
            .AsNoTracking()
            .Where(x => string.IsNullOrWhiteSpace(search) || x.Name.ToLower().Contains(search!.ToLower()))
            .OrderBy(x => x.Name)
            .Select(c => new CategoryDto(c.Id, c.Name, c.Slug, c.IsActive))
            .ToListAsync(ct);
    }

    public async Task<CategoryDto> CreateCategoryAsync(CategoryRequest request, CancellationToken ct = default)
    {
        var name = request.Name.Trim();
        if (name.Length < 2)
            throw new ValidationException("Category name must be at least two characters.");

        var slug = Slug(name);
        if (await _db.Categories.AnyAsync(x => x.Slug == slug, ct))
            throw new ConflictException("Category name already exists.");

        var c = new Category { Name = name, Slug = slug };
        _db.Categories.Add(c);
        await _db.SaveChangesAsync(ct);
        
        return new CategoryDto(c.Id, c.Name, c.Slug, c.IsActive);
    }

    public async Task<CategoryDto> UpdateCategoryAsync(Guid id, CategoryRequest request, CancellationToken ct = default)
    {
        var c = await _db.Categories.FindAsync(new object[] { id }, ct);
        if (c is null) throw new NotFoundException("Category not found.");

        var name = request.Name.Trim();
        if (name.Length < 2)
            throw new ValidationException("Category name must be at least two characters.");

        var slug = Slug(name);
        if (await _db.Categories.AnyAsync(x => x.Slug == slug && x.Id != id, ct))
            throw new ConflictException("Category name already exists.");

        c.Name = name;
        c.Slug = slug;
        await _db.SaveChangesAsync(ct);

        return new CategoryDto(c.Id, c.Name, c.Slug, c.IsActive);
    }

    public async Task<CategoryDto> UpdateCategoryStatusAsync(Guid id, StatusRequest request, CancellationToken ct = default)
    {
        var c = await _db.Categories.FindAsync(new object[] { id }, ct);
        if (c is null) throw new NotFoundException("Category not found.");

        c.IsActive = request.IsActive;
        await _db.SaveChangesAsync(ct);

        return new CategoryDto(c.Id, c.Name, c.Slug, c.IsActive);
    }

    private static string Slug(string v) => 
        string.Join('-', v.ToLowerInvariant().Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)).Replace("/", "-");
}
