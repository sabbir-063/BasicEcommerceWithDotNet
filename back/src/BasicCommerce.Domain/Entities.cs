namespace BasicCommerce.Domain;

public enum UserRole { Customer, Admin }
public enum OrderStatus { Pending, Confirmed, Shipped, Delivered, Cancelled }
public enum PaymentMethod { CashOnDelivery }

public abstract class Entity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}

public sealed class User : Entity
{
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public string? Phone { get; set; }
    public UserRole Role { get; set; } = UserRole.Customer;
    public bool IsActive { get; set; } = true;
    public Cart? Cart { get; set; }
    public List<Order> Orders { get; set; } = [];
}

public sealed class Category : Entity
{
    public string Name { get; set; } = "";
    public string Slug { get; set; } = "";
    public bool IsActive { get; set; } = true;
    public List<Product> Products { get; set; } = [];
}

public sealed class Product : Entity
{
    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public string Name { get; set; } = "";
    public string Slug { get; set; } = "";
    public string Description { get; set; } = "";
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public string? ImageUrl { get; set; }
    public string? ImagePublicId { get; set; }
    public string? ImageAltText { get; set; }
    public bool IsActive { get; set; } = true;
}

public sealed class Cart : Entity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public List<CartItem> Items { get; set; } = [];
}

public sealed class CartItem : Entity
{
    public Guid CartId { get; set; }
    public Cart Cart { get; set; } = null!;
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int Quantity { get; set; }
}

public sealed class Order : Entity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string OrderNumber { get; set; } = "";
    public string CustomerName { get; set; } = "";
    public string Phone { get; set; } = "";
    public string ShippingAddress { get; set; } = "";
    public decimal TotalAmount { get; set; }
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.CashOnDelivery;
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public DateTimeOffset? CancelledAt { get; set; }
    public List<OrderItem> Items { get; set; } = [];
}

public sealed class OrderItem : Entity
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public string ProductName { get; set; } = "";
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal LineTotal { get; set; }
}
