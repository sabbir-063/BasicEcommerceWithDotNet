namespace BasicCommerce.Domain;

public static class OrderRules
{
    public static bool CanTransition(OrderStatus from, OrderStatus to) => (from, to) is
        (OrderStatus.Pending, OrderStatus.Confirmed) or
        (OrderStatus.Pending, OrderStatus.Cancelled) or
        (OrderStatus.Confirmed, OrderStatus.Shipped) or
        (OrderStatus.Confirmed, OrderStatus.Cancelled) or
        (OrderStatus.Shipped, OrderStatus.Delivered);
}
