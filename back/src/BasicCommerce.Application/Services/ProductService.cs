using BasicCommerce.Application.Contracts;
using BasicCommerce.Application.DTOs;
using BasicCommerce.Application.Exceptions;
using BasicCommerce.Domain;
using Microsoft.EntityFrameworkCore;

namespace BasicCommerce.Application.Services;

public class ProductService : IProductService
{
    private readonly IAppDbContext _db;
    private readonly IMediaService _media;

    public ProductService(IAppDbContext db, IMediaService media)
    {
        _db = db;
        _media = media;
    }

    public async Task<ProductListResponse> GetProductsAsync(int? page, int? pageSize, string? search, Guid? categoryId, string? sort, CancellationToken ct = default)
    {
        var q = _db.Products.AsNoTracking().Include(x => x.Category).Where(x => x.IsActive && x.Category.IsActive);
        
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            q = q.Where(x => x.Name.ToLower().Contains(s) || x.Description.ToLower().Contains(s));
        }
            
        if (categoryId.HasValue) 
            q = q.Where(x => x.CategoryId == categoryId);
            
        q = sort switch { 
            "price_asc" => q.OrderBy(x => x.Price), 
            "price_desc" => q.OrderByDescending(x => x.Price), 
            "name_asc" => q.OrderBy(x => x.Name), 
            _ => q.OrderByDescending(x => x.CreatedAt) 
        };
        
        var pg = Math.Max(1, page ?? 1); 
        var ps = Math.Clamp(pageSize ?? 12, 1, 100); 
        var total = await q.CountAsync(ct);
        
        var items = await q.Skip((pg - 1) * ps).Take(ps).Select(p => new ProductDto(p.Id, p.CategoryId, p.Category.Name, p.Name, p.Slug, p.Description, p.Price, p.StockQuantity, p.ImageUrl, p.ImageAltText, p.IsActive)).ToListAsync(ct);
        
        return new ProductListResponse(items, pg, ps, total, (int)Math.Ceiling(total / (double)ps));
    }

    public async Task<ProductDto> GetProductAsync(string idOrSlug, CancellationToken ct = default)
    {
        Product? p = Guid.TryParse(idOrSlug, out var id) 
            ? await _db.Products.Include(x => x.Category).SingleOrDefaultAsync(x => x.Id == id, ct) 
            : await _db.Products.Include(x => x.Category).SingleOrDefaultAsync(x => x.Slug == idOrSlug, ct);
            
        if (p is null || !p.IsActive || !p.Category.IsActive) 
            throw new NotFoundException("Product not found.");
            
        return new ProductDto(p.Id, p.CategoryId, p.Category.Name, p.Name, p.Slug, p.Description, p.Price, p.StockQuantity, p.ImageUrl, p.ImageAltText, p.IsActive);
    }

    public async Task<ProductListResponse> GetAdminProductsAsync(int? page, int? pageSize, string? search, Guid? categoryId, string? sort, CancellationToken ct = default)
    {
        var q = _db.Products.AsNoTracking().Include(x => x.Category).AsQueryable();
        
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            q = q.Where(x => x.Name.ToLower().Contains(s) || x.Description.ToLower().Contains(s));
        }
            
        if (categoryId.HasValue) 
            q = q.Where(x => x.CategoryId == categoryId);
            
        q = sort switch { 
            "price_asc" => q.OrderBy(x => x.Price), 
            "price_desc" => q.OrderByDescending(x => x.Price), 
            "name_asc" => q.OrderBy(x => x.Name), 
            _ => q.OrderByDescending(x => x.CreatedAt) 
        };
        
        var pg = Math.Max(1, page ?? 1); 
        var ps = Math.Clamp(pageSize ?? 12, 1, 100); 
        var total = await q.CountAsync(ct);
        
        var items = await q.Skip((pg - 1) * ps).Take(ps).Select(p => new ProductDto(p.Id, p.CategoryId, p.Category.Name, p.Name, p.Slug, p.Description, p.Price, p.StockQuantity, p.ImageUrl, p.ImageAltText, p.IsActive)).ToListAsync(ct);
        
        return new ProductListResponse(items, pg, ps, total, (int)Math.Ceiling(total / (double)ps));
    }

    public async Task<ProductDto> GetAdminProductAsync(Guid id, CancellationToken ct = default)
    {
        var p = await _db.Products.Include(x => x.Category).SingleOrDefaultAsync(x => x.Id == id, ct);
        if (p is null) throw new NotFoundException("Product not found.");
        return new ProductDto(p.Id, p.CategoryId, p.Category.Name, p.Name, p.Slug, p.Description, p.Price, p.StockQuantity, p.ImageUrl, p.ImageAltText, p.IsActive);
    }

    public async Task<ProductDto> CreateProductAsync(ProductRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || request.Name.Length > 200)
            throw new ValidationException("Product name must be provided and under 200 characters.", "VALIDATION_ERROR");
        if (request.Price < 0)
            throw new ValidationException("Product price cannot be negative.", "VALIDATION_ERROR");
        if (request.StockQuantity < 0)
            throw new ValidationException("Product stock cannot be negative.", "VALIDATION_ERROR");
            
        if (await _db.Categories.FindAsync(new object[] { request.CategoryId }, ct) is null) 
            throw new ValidationException("Category not found.");
            
        var p = new Product 
        {
            CategoryId = request.CategoryId,
            Name = request.Name.Trim(),
            Slug = Slug(request.Name),
            Description = request.Description?.Trim() ?? "",
            Price = request.Price,
            StockQuantity = request.StockQuantity,
            ImageUrl = request.ImageUrl,
            ImagePublicId = request.ImagePublicId,
            ImageAltText = request.ImageAltText,
            IsActive = request.IsActive
        };
        
        _db.Products.Add(p);
        await _db.SaveChangesAsync(ct);
        
        return new ProductDto(p.Id, p.CategoryId, null, p.Name, p.Slug, p.Description, p.Price, p.StockQuantity, p.ImageUrl, p.ImageAltText, p.IsActive);
    }

    public async Task<ProductDto> UpdateProductAsync(Guid id, ProductRequest request, CancellationToken ct = default)
    {
        var p = await _db.Products.FindAsync(new object[] { id }, ct);
        if (p is null) throw new NotFoundException("Product not found.");
        
        if (string.IsNullOrWhiteSpace(request.Name) || request.Name.Length > 200)
            throw new ValidationException("Product name must be provided and under 200 characters.", "VALIDATION_ERROR");
        if (request.Price < 0)
            throw new ValidationException("Product price cannot be negative.", "VALIDATION_ERROR");
        if (request.StockQuantity < 0)
            throw new ValidationException("Product stock cannot be negative.", "VALIDATION_ERROR");
            
        if (await _db.Categories.FindAsync(new object[] { request.CategoryId }, ct) is null) 
            throw new ValidationException("Category not found.");
            
        if (!string.IsNullOrWhiteSpace(p.ImagePublicId) && p.ImagePublicId != request.ImagePublicId)
        {
            await _media.DeleteImageAsync(p.ImagePublicId, ct);
        }
            
        p.CategoryId = request.CategoryId;
        p.Name = request.Name.Trim();
        p.Slug = Slug(request.Name);
        p.Description = request.Description?.Trim() ?? "";
        p.Price = request.Price;
        p.StockQuantity = request.StockQuantity;
        p.ImageUrl = request.ImageUrl;
        p.ImagePublicId = request.ImagePublicId;
        p.ImageAltText = request.ImageAltText;
        p.IsActive = request.IsActive;
        
        await _db.SaveChangesAsync(ct);
        
        return new ProductDto(p.Id, p.CategoryId, null, p.Name, p.Slug, p.Description, p.Price, p.StockQuantity, p.ImageUrl, p.ImageAltText, p.IsActive);
    }

    public async Task<ProductDto> UpdateProductStockAsync(Guid id, StockRequest request, CancellationToken ct = default)
    {
        var p = await _db.Products.FindAsync(new object[] { id }, ct);
        if (p is null) throw new NotFoundException("Product not found.");
        
        if (request.StockQuantity < 0) throw new ValidationException("Stock cannot be negative.");
        
        p.StockQuantity = request.StockQuantity;
        await _db.SaveChangesAsync(ct);
        
        return new ProductDto(p.Id, p.CategoryId, null, p.Name, p.Slug, p.Description, p.Price, p.StockQuantity, p.ImageUrl, p.ImageAltText, p.IsActive);
    }

    public async Task<ProductDto> UpdateProductStatusAsync(Guid id, StatusRequest request, CancellationToken ct = default)
    {
        var p = await _db.Products.FindAsync(new object[] { id }, ct);
        if (p is null) throw new NotFoundException("Product not found.");
        
        p.IsActive = request.IsActive;
        await _db.SaveChangesAsync(ct);
        
        return new ProductDto(p.Id, p.CategoryId, null, p.Name, p.Slug, p.Description, p.Price, p.StockQuantity, p.ImageUrl, p.ImageAltText, p.IsActive);
    }

    public async Task DeleteProductAsync(Guid id, CancellationToken ct = default)
    {
        var p = await _db.Products.FindAsync(new object[] { id }, ct);
        if (p is null) throw new NotFoundException("Product not found.");
        
        if (!string.IsNullOrWhiteSpace(p.ImagePublicId))
        {
            await _media.DeleteImageAsync(p.ImagePublicId, ct);
        }
        
        _db.Products.Remove(p);
        await _db.SaveChangesAsync(ct);
    }

    private static string Slug(string v) => 
        string.Join('-', v.ToLowerInvariant().Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)).Replace("/", "-");
}
