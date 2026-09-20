using BasicCommerce.Domain;
using Microsoft.EntityFrameworkCore;

namespace BasicCommerce.Infrastructure;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<User>(e => { e.ToTable("users"); e.HasKey(x => x.Id); e.Property(x => x.Name).HasMaxLength(120).IsRequired(); e.Property(x => x.Email).HasMaxLength(320).IsRequired(); e.HasIndex(x => x.Email).IsUnique(); e.Property(x => x.Role).HasConversion<string>().HasMaxLength(20); });
        b.Entity<Category>(e => { e.ToTable("categories"); e.HasKey(x => x.Id); e.Property(x => x.Name).HasMaxLength(100).IsRequired(); e.Property(x => x.Slug).HasMaxLength(120).IsRequired(); e.HasIndex(x => x.Slug).IsUnique(); });
        b.Entity<Product>(e => { e.ToTable("products"); e.HasKey(x => x.Id); e.Property(x => x.Name).HasMaxLength(180).IsRequired(); e.Property(x => x.Slug).HasMaxLength(220).IsRequired(); e.Property(x => x.Price).HasPrecision(12, 2); e.HasIndex(x => x.Slug).IsUnique(); e.HasIndex(x => new { x.IsActive, x.CategoryId }); e.HasOne(x => x.Category).WithMany(x => x.Products).HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.Restrict); });
        b.Entity<Cart>(e => { e.ToTable("carts"); e.HasKey(x => x.Id); e.HasIndex(x => x.UserId).IsUnique(); e.HasOne(x => x.User).WithOne(x => x.Cart).HasForeignKey<Cart>(x => x.UserId).OnDelete(DeleteBehavior.Cascade); });
        b.Entity<CartItem>(e => { e.ToTable("cart_items", t => t.HasCheckConstraint("ck_cart_item_quantity", "\"Quantity\" > 0")); e.HasKey(x => x.Id); e.HasIndex(x => new { x.CartId, x.ProductId }).IsUnique(); e.HasOne(x => x.Cart).WithMany(x => x.Items).HasForeignKey(x => x.CartId).OnDelete(DeleteBehavior.Cascade); e.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict); });
        b.Entity<Order>(e => { e.ToTable("orders"); e.HasKey(x => x.Id); e.Property(x => x.OrderNumber).HasMaxLength(40).IsRequired(); e.HasIndex(x => x.OrderNumber).IsUnique(); e.Property(x => x.TotalAmount).HasPrecision(12, 2); e.Property(x => x.PaymentMethod).HasConversion<string>().HasMaxLength(30); e.Property(x => x.Status).HasConversion<string>().HasMaxLength(20); e.HasOne(x => x.User).WithMany(x => x.Orders).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Restrict); });
        b.Entity<OrderItem>(e => { e.ToTable("order_items"); e.HasKey(x => x.Id); e.Property(x => x.UnitPrice).HasPrecision(12, 2); e.Property(x => x.LineTotal).HasPrecision(12, 2); e.HasOne(x => x.Order).WithMany(x => x.Items).HasForeignKey(x => x.OrderId).OnDelete(DeleteBehavior.Cascade); e.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict); });
    }
}
