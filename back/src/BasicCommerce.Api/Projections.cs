using BasicCommerce.Domain;
using System.Linq.Expressions;

public static class Projections
{
    public static Expression<Func<Category, object>> CategoryDtoExpr() => c => new { id = c.Id, name = c.Name, slug = c.Slug, isActive = c.IsActive };
    public static Expression<Func<Product, object>> ProductListExpr() => p => new { id = p.Id, categoryId = p.CategoryId, categoryName = p.Category.Name, name = p.Name, slug = p.Slug, description = p.Description, price = p.Price, stockQuantity = p.StockQuantity, imageUrl = p.ImageUrl, imageAltText = p.ImageAltText, isActive = p.IsActive };
    public static Expression<Func<Order, object>> OrderSummaryExpr() => o => new { id = o.Id, orderNumber = o.OrderNumber, customerName = o.CustomerName, status = o.Status.ToString(), paymentMethod = o.PaymentMethod.ToString(), totalAmount = o.TotalAmount, createdAt = o.CreatedAt };
}
