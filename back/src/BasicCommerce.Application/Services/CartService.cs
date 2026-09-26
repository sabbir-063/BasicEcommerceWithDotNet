using BasicCommerce.Application.Contracts;
using BasicCommerce.Application.DTOs;
using BasicCommerce.Application.Exceptions;
using BasicCommerce.Domain;
using Microsoft.EntityFrameworkCore;

namespace BasicCommerce.Application.Services;

public class CartService : ICartService
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUserService;

    public CartService(IAppDbContext db, ICurrentUserService currentUserService)
    {
        _db = db;
        _currentUserService = currentUserService;
    }

    public async Task<CartDto> GetCartAsync(CancellationToken ct = default)
    {
        var uid = _currentUserService.GetUserId();
        var cart = await _db.Carts.Include(x => x.Items).ThenInclude(x => x.Product)
            .SingleOrDefaultAsync(x => x.UserId == uid, ct);
            
        if (cart is null) 
            return new CartDto(Guid.Empty, Array.Empty<CartItemDto>(), 0, 0m);
            
        var items = cart.Items.Select(i => new CartItemDto(
            i.Id, i.ProductId, i.Product.Name, i.Product.ImageUrl, 
            i.Product.Price, i.Quantity, i.Product.StockQuantity, 
            i.Product.Price * i.Quantity
        )).ToList();
        
        return new CartDto(cart.Id, items, items.Sum(x => x.Quantity), items.Sum(x => x.LineTotal));
    }

    public async Task AddToCartAsync(AddCartRequest request, CancellationToken ct = default)
    {
        if (request.Quantity < 1) 
            throw new ValidationException("Quantity must be at least 1.");
            
        var p = await _db.Products.Include(x => x.Category)
            .SingleOrDefaultAsync(x => x.Id == request.ProductId && x.IsActive && x.Category.IsActive, ct);
            
        if (p is null) throw new NotFoundException("Product not found.");
        
        var uid = _currentUserService.GetUserId();
        var cart = await GetOrCreateCartAsync(uid, ct);
        
        var item = await _db.CartItems.SingleOrDefaultAsync(x => x.CartId == cart.Id && x.ProductId == p.Id, ct);
        var qty = (item?.Quantity ?? 0) + request.Quantity;
        
        if (qty > p.StockQuantity) 
            throw new ConflictException("Requested quantity exceeds available stock.", "STOCK_CONFLICT");
            
        if (item is null) 
            _db.CartItems.Add(new CartItem { CartId = cart.Id, ProductId = p.Id, Quantity = qty });
        else 
            item.Quantity = qty;
            
        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateCartItemAsync(Guid itemId, UpdateCartRequest request, CancellationToken ct = default)
    {
        var uid = _currentUserService.GetUserId();
        var item = await _db.CartItems.Include(x => x.Product).Include(x => x.Cart)
            .SingleOrDefaultAsync(x => x.Id == itemId && x.Cart.UserId == uid, ct);
            
        if (item is null) throw new NotFoundException("Cart item not found.");
        
        if (request.Quantity < 1 || request.Quantity > item.Product.StockQuantity) 
            throw new ConflictException("Quantity is outside the available stock.", "STOCK_CONFLICT");
            
        item.Quantity = request.Quantity;
        await _db.SaveChangesAsync(ct);
    }

    public async Task RemoveCartItemAsync(Guid itemId, CancellationToken ct = default)
    {
        var uid = _currentUserService.GetUserId();
        var item = await _db.CartItems.Include(x => x.Cart)
            .SingleOrDefaultAsync(x => x.Id == itemId && x.Cart.UserId == uid, ct);
            
        if (item is null) throw new NotFoundException("Cart item not found.");
        
        _db.CartItems.Remove(item);
        await _db.SaveChangesAsync(ct);
    }

    public async Task ClearCartAsync(CancellationToken ct = default)
    {
        var uid = _currentUserService.GetUserId();
        var items = await _db.CartItems.Include(x => x.Cart).Where(x => x.Cart.UserId == uid).ToListAsync(ct);
        
        _db.CartItems.RemoveRange(items);
        await _db.SaveChangesAsync(ct);
    }

    private async Task<Cart> GetOrCreateCartAsync(Guid uid, CancellationToken ct)
    {
        var c = await _db.Carts.SingleOrDefaultAsync(x => x.UserId == uid, ct);
        if (c is not null) return c;
        
        c = new Cart { UserId = uid };
        _db.Carts.Add(c);
        await _db.SaveChangesAsync(ct);
        return c;
    }
}
