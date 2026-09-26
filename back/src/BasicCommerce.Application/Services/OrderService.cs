using BasicCommerce.Application.Contracts;
using BasicCommerce.Application.DTOs;
using BasicCommerce.Application.Exceptions;
using BasicCommerce.Domain;
using Microsoft.EntityFrameworkCore;

namespace BasicCommerce.Application.Services;

public class OrderService : IOrderService
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUserService;

    public OrderService(IAppDbContext db, ICurrentUserService currentUserService)
    {
        _db = db;
        _currentUserService = currentUserService;
    }

    public async Task<OrderDto> CheckoutAsync(CheckoutRequest request, CancellationToken ct = default)
    {
        if (request.PaymentMethod != PaymentMethod.CashOnDelivery || 
            string.IsNullOrWhiteSpace(request.CustomerName) || 
            string.IsNullOrWhiteSpace(request.Phone) || 
            string.IsNullOrWhiteSpace(request.ShippingAddress))
        {
            throw new ValidationException("COD, name, phone and address are required.");
        }
            
        var uid = _currentUserService.GetUserId();
        
        await using var tx = await _db.BeginTransactionAsync(System.Data.IsolationLevel.Serializable, ct);
        
        var cart = await _db.Carts.Include(x => x.Items).ThenInclude(x => x.Product)
            .SingleOrDefaultAsync(x => x.UserId == uid, ct);
            
        if (cart is null || cart.Items.Count == 0) 
            throw new ValidationException("Add an item before checkout.", "EMPTY_CART");
            
        if (cart.Items.Any(i => !i.Product.IsActive || i.Quantity > i.Product.StockQuantity)) 
            throw new ConflictException("Cart stock changed. Please review your cart.", "STOCK_CONFLICT");
            
        var order = new Order 
        { 
            UserId = uid, 
            OrderNumber = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(100000, 999999)}", 
            CustomerName = request.CustomerName.Trim(), 
            Phone = request.Phone.Trim(), 
            ShippingAddress = request.ShippingAddress.Trim(), 
            TotalAmount = cart.Items.Sum(i => i.Product.Price * i.Quantity) 
        };
        
        foreach (var i in cart.Items) 
        { 
            order.Items.Add(new OrderItem 
            { 
                ProductId = i.ProductId, 
                ProductName = i.Product.Name, 
                UnitPrice = i.Product.Price, 
                Quantity = i.Quantity, 
                LineTotal = i.Product.Price * i.Quantity 
            }); 
            i.Product.StockQuantity -= i.Quantity; 
        }
        
        _db.Orders.Add(order); 
        _db.CartItems.RemoveRange(cart.Items); 
        
        await _db.SaveChangesAsync(ct); 
        await tx.CommitAsync(ct); 
        
        return MapOrderToDto(order);
    }

    public async Task<OrderListResponse> GetMyOrdersAsync(int? page, int? pageSize, CancellationToken ct = default)
    {
        var uid = _currentUserService.GetUserId();
        var q = _db.Orders.AsNoTracking().Where(x => x.UserId == uid).OrderByDescending(x => x.CreatedAt);
        
        var pg = Math.Max(1, page ?? 1); 
        var ps = Math.Clamp(pageSize ?? 10, 1, 50); 
        var total = await q.CountAsync(ct);
        
        var items = await q.Skip((pg - 1) * ps).Take(ps)
            .Select(o => new OrderSummaryDto(o.Id, o.OrderNumber, o.CustomerName, o.Status.ToString(), o.TotalAmount, o.Items.Count, o.CreatedAt))
            .ToListAsync(ct);
            
        return new OrderListResponse(items, pg, ps, total, (int)Math.Ceiling(total / (double)ps));
    }

    public async Task<OrderDto> GetMyOrderAsync(Guid id, CancellationToken ct = default)
    {
        var uid = _currentUserService.GetUserId();
        var o = await _db.Orders.AsNoTracking().Include(x => x.Items)
            .SingleOrDefaultAsync(x => x.Id == id && x.UserId == uid, ct);
            
        if (o is null) throw new NotFoundException("Order not found.");
        return MapOrderToDto(o);
    }

    public async Task<OrderDto> CancelMyOrderAsync(Guid id, CancellationToken ct = default)
    {
        var uid = _currentUserService.GetUserId();
        return await CancelOrderInternalAsync(id, uid, false, ct);
    }

    public async Task<OrderListResponse> GetAdminOrdersAsync(int? page, int? pageSize, string? status, string? search, CancellationToken ct = default)
    {
        var q = _db.Orders.AsNoTracking().AsQueryable();
        
        if (!string.IsNullOrWhiteSpace(status))
            q = q.Where(x => x.Status.ToString() == status);
            
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            q = q.Where(x => x.OrderNumber.ToLower().Contains(s) || x.CustomerName.ToLower().Contains(s));
        }
            
        q = q.OrderByDescending(x => x.CreatedAt);
        
        var pg = Math.Max(1, page ?? 1); 
        var ps = Math.Clamp(pageSize ?? 20, 1, 100); 
        var total = await q.CountAsync(ct);
        
        var items = await q.Skip((pg - 1) * ps).Take(ps)
            .Select(o => new OrderSummaryDto(o.Id, o.OrderNumber, o.CustomerName, o.Status.ToString(), o.TotalAmount, o.Items.Count, o.CreatedAt))
            .ToListAsync(ct);
            
        return new OrderListResponse(items, pg, ps, total, (int)Math.Ceiling(total / (double)ps));
    }

    public async Task<OrderDto> GetAdminOrderAsync(Guid id, CancellationToken ct = default)
    {
        var o = await _db.Orders.AsNoTracking().Include(x => x.Items)
            .SingleOrDefaultAsync(x => x.Id == id, ct);
            
        if (o is null) throw new NotFoundException("Order not found.");
        return MapOrderToDto(o);
    }

    public async Task<OrderDto> UpdateOrderStatusAsync(Guid id, StatusValueRequest request, CancellationToken ct = default)
    {
        if (!Enum.TryParse<OrderStatus>(request.Status, true, out var target)) 
            throw new ValidationException("Unknown status.");
            
        var o = await _db.Orders.Include(x => x.Items).SingleOrDefaultAsync(x => x.Id == id, ct);
        if (o is null) throw new NotFoundException("Order not found.");
        
        if (!OrderRules.CanTransition(o.Status, target)) 
            throw new ConflictException("That status transition is not allowed.", "INVALID_ORDER_TRANSITION");
            
        if (target == OrderStatus.Cancelled) 
            return await CancelOrderInternalAsync(id, o.UserId, true, ct);
            
        o.Status = target;
        await _db.SaveChangesAsync(ct);
        return MapOrderToDto(o);
    }

    public async Task<DashboardSummary> GetDashboardSummaryAsync(CancellationToken ct = default)
    {
        return new DashboardSummary(
            await _db.Products.CountAsync(ct),
            await _db.Products.CountAsync(x => x.IsActive, ct),
            await _db.Orders.CountAsync(ct),
            await _db.Orders.CountAsync(x => x.Status == OrderStatus.Pending, ct),
            await _db.Users.CountAsync(x => x.Role == UserRole.Customer, ct)
        );
    }

    private async Task<OrderDto> CancelOrderInternalAsync(Guid id, Guid uid, bool admin, CancellationToken ct)
    {
        await using var tx = await _db.BeginTransactionAsync(System.Data.IsolationLevel.Serializable, ct);
        
        var o = await _db.Orders.Include(x => x.Items)
            .SingleOrDefaultAsync(x => x.Id == id && (admin || x.UserId == uid), ct);
            
        if (o is null) throw new NotFoundException("Order not found.");
        if (!OrderRules.CanTransition(o.Status, OrderStatus.Cancelled)) 
            throw new ConflictException("That order cannot be cancelled.", "ORDER_NOT_CANCELLABLE");
            
        var ids = o.Items.Select(i => i.ProductId).ToArray();
        var products = await _db.Products.Where(x => ids.Contains(x.Id)).ToListAsync(ct);
        
        foreach (var item in o.Items) 
            products.Single(x => x.Id == item.ProductId).StockQuantity += item.Quantity;
            
        o.Status = OrderStatus.Cancelled;
        o.CancelledAt = DateTimeOffset.UtcNow;
        
        await _db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        
        return MapOrderToDto(o);
    }

    private static OrderDto MapOrderToDto(Order o) => new OrderDto(
        o.Id, o.OrderNumber, o.CustomerName, o.Phone, o.ShippingAddress, o.Status.ToString(), 
        o.PaymentMethod.ToString(), o.TotalAmount, o.CreatedAt, 
        o.Items.Select(i => new OrderItemDto(i.Id, i.ProductId, i.ProductName, i.UnitPrice, i.Quantity, i.LineTotal))
    );
}
