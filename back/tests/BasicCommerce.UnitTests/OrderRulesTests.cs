using BasicCommerce.Domain;

namespace BasicCommerce.UnitTests;

public sealed class OrderRulesTests
{
    [Theory]
    [InlineData(OrderStatus.Pending, OrderStatus.Confirmed)]
    [InlineData(OrderStatus.Pending, OrderStatus.Cancelled)]
    [InlineData(OrderStatus.Confirmed, OrderStatus.Shipped)]
    [InlineData(OrderStatus.Confirmed, OrderStatus.Cancelled)]
    [InlineData(OrderStatus.Shipped, OrderStatus.Delivered)]
    public void Allows_documented_transitions(OrderStatus from, OrderStatus to) =>
        Assert.True(OrderRules.CanTransition(from, to));

    [Theory]
    [InlineData(OrderStatus.Delivered, OrderStatus.Cancelled)]
    [InlineData(OrderStatus.Cancelled, OrderStatus.Pending)]
    [InlineData(OrderStatus.Shipped, OrderStatus.Cancelled)]
    [InlineData(OrderStatus.Confirmed, OrderStatus.Pending)]
    public void Rejects_invalid_or_terminal_transitions(OrderStatus from, OrderStatus to) =>
        Assert.False(OrderRules.CanTransition(from, to));
}
