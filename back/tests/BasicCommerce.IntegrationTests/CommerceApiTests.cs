using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using BasicCommerce.Domain;
using BasicCommerce.Infrastructure;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace BasicCommerce.IntegrationTests;

public sealed class CommerceApiTests : IClassFixture<IntegrationApplication>
{
    private readonly IntegrationApplication _application;
    private readonly HttpClient _client;

    public CommerceApiTests(IntegrationApplication application)
    {
        _application = application;
        _client = application.Client;
    }

    [Fact]
    public async Task Registration_login_and_admin_boundary_follow_the_contract()
    {
        var email = $"customer-{Guid.NewGuid():N}@example.test";
        var registration = new
        {
            name = "Integration Customer",
            email,
            password = "SafePass123!",
            phone = "01700000000"
        };

        var created = await _client.PostAsJsonAsync("/api/auth/register", registration);
        Assert.Equal(HttpStatusCode.Created, created.StatusCode);

        var duplicate = await _client.PostAsJsonAsync("/api/auth/register", registration);
        Assert.Equal(HttpStatusCode.Conflict, duplicate.StatusCode);
        Assert.Equal("EMAIL_ALREADY_EXISTS", await ReadCodeAsync(duplicate));

        var login = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            email,
            password = "SafePass123!"
        });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
        var token = (await login.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("accessToken").GetString();
        Assert.False(string.IsNullOrWhiteSpace(token));

        using var request = new HttpRequestMessage(HttpMethod.Get, "/api/admin/dashboard/summary");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        var forbidden = await _client.SendAsync(request);
        Assert.Equal(HttpStatusCode.Forbidden, forbidden.StatusCode);
    }

    [Fact]
    public async Task Cart_checkout_ownership_and_cancellation_use_real_PostgreSQL()
    {
        var productId = await AddProductAsync(stock: 5, price: 1250m);
        var first = await RegisterAndLoginAsync("first");
        var second = await RegisterAndLoginAsync("second");

        using (var add = AuthorizedRequest(first, HttpMethod.Post, "/api/cart/items",
                   JsonContent.Create(new { productId, quantity = 2 })))
        {
            var response = await _client.SendAsync(add);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        JsonElement createdOrder;
        using (var checkout = AuthorizedRequest(first, HttpMethod.Post, "/api/orders",
                   JsonContent.Create(new
                   {
                       customerName = "Integration Customer",
                       phone = "01700000000",
                       shippingAddress = "House 1, Dhaka",
                       paymentMethod = "CashOnDelivery"
                   })))
        {
            var response = await _client.SendAsync(checkout);
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            createdOrder = await response.Content.ReadFromJsonAsync<JsonElement>();
        }

        var orderId = createdOrder.GetProperty("id").GetGuid();
        Assert.Equal("Pending", createdOrder.GetProperty("status").GetString());
        Assert.Equal(2500m, createdOrder.GetProperty("totalAmount").GetDecimal());

        using (var cart = AuthorizedRequest(first, HttpMethod.Get, "/api/cart"))
        {
            var response = await _client.SendAsync(cart);
            var body = await response.Content.ReadFromJsonAsync<JsonElement>();
            Assert.Equal(0, body.GetProperty("itemCount").GetInt32());
        }

        using (var forbiddenOrder = AuthorizedRequest(second, HttpMethod.Get, $"/api/orders/{orderId}"))
        {
            var response = await _client.SendAsync(forbiddenOrder);
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        using (var cancel = AuthorizedRequest(first, HttpMethod.Post, $"/api/orders/{orderId}/cancel"))
        {
            var response = await _client.SendAsync(cancel);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        using (var cancelAgain = AuthorizedRequest(first, HttpMethod.Post, $"/api/orders/{orderId}/cancel"))
        {
            var response = await _client.SendAsync(cancelAgain);
            Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        }

        await using var scope = _application.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        Assert.Equal(5, await db.Products.Where(product => product.Id == productId)
            .Select(product => product.StockQuantity).SingleAsync());
        Assert.Equal(OrderStatus.Cancelled, await db.Orders.Where(order => order.Id == orderId)
            .Select(order => order.Status).SingleAsync());
    }

    [Fact]
    public async Task Inactive_account_cannot_log_in_and_admin_can_access_admin_api()
    {
        var inactiveEmail = $"inactive-{Guid.NewGuid():N}@example.test";
        var adminEmail = $"admin-{Guid.NewGuid():N}@example.test";
        await AddAccountAsync(inactiveEmail, UserRole.Customer, isActive: false);
        await AddAccountAsync(adminEmail, UserRole.Admin, isActive: true);

        var inactive = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            email = inactiveEmail,
            password = "SafePass123!"
        });
        Assert.Equal(HttpStatusCode.Unauthorized, inactive.StatusCode);
        Assert.Equal("ACCOUNT_INACTIVE", await ReadCodeAsync(inactive));

        var adminLogin = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            email = adminEmail,
            password = "SafePass123!"
        });
        Assert.Equal(HttpStatusCode.OK, adminLogin.StatusCode);
        var token = (await adminLogin.Content.ReadFromJsonAsync<JsonElement>())
            .GetProperty("accessToken").GetString()!;
        using var summary = AuthorizedRequest(token, HttpMethod.Get, "/api/admin/dashboard/summary");
        Assert.Equal(HttpStatusCode.OK, (await _client.SendAsync(summary)).StatusCode);
    }

    [Fact]
    public async Task Category_validation_duplicate_and_public_filtering_follow_the_contract()
    {
        var adminEmail = $"admin-{Guid.NewGuid():N}@example.test";
        await AddAccountAsync(adminEmail, UserRole.Admin, isActive: true);
        var login = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            email = adminEmail,
            password = "SafePass123!"
        });
        var token = (await login.Content.ReadFromJsonAsync<JsonElement>())
            .GetProperty("accessToken").GetString()!;

        using (var invalid = AuthorizedRequest(token, HttpMethod.Post, "/api/admin/categories",
                   JsonContent.Create(new { name = " " })))
        {
            var response = await _client.SendAsync(invalid);
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            Assert.Equal("VALIDATION_ERROR", await ReadCodeAsync(response));
        }

        var name = $"Integration {Guid.NewGuid():N}";
        Guid categoryId;
        using (var create = AuthorizedRequest(token, HttpMethod.Post, "/api/admin/categories",
                   JsonContent.Create(new { name })))
        {
            var response = await _client.SendAsync(create);
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            categoryId = (await response.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("id").GetGuid();
        }

        using (var duplicate = AuthorizedRequest(token, HttpMethod.Post, "/api/admin/categories",
                   JsonContent.Create(new { name })))
        {
            var response = await _client.SendAsync(duplicate);
            Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        }

        Guid otherCategoryId;
        using (var createOther = AuthorizedRequest(token, HttpMethod.Post, "/api/admin/categories",
                   JsonContent.Create(new { name = $"Other {Guid.NewGuid():N}" })))
        {
            var response = await _client.SendAsync(createOther);
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            otherCategoryId = (await response.Content.ReadFromJsonAsync<JsonElement>())
                .GetProperty("id").GetGuid();
        }

        using (var duplicateUpdate = AuthorizedRequest(token, HttpMethod.Put,
                   $"/api/admin/categories/{otherCategoryId}", JsonContent.Create(new { name })))
        {
            var response = await _client.SendAsync(duplicateUpdate);
            Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
            Assert.Equal("CONCURRENCY_CONFLICT", await ReadCodeAsync(response));
        }

        var product = new
        {
            categoryId,
            name = $"Duplicate product {Guid.NewGuid():N}",
            description = "Integration product",
            price = 100m,
            stockQuantity = 2,
            isActive = true
        };
        using (var createProduct = AuthorizedRequest(token, HttpMethod.Post, "/api/admin/products",
                   JsonContent.Create(product)))
        {
            Assert.Equal(HttpStatusCode.Created, (await _client.SendAsync(createProduct)).StatusCode);
        }
        using (var duplicateProduct = AuthorizedRequest(token, HttpMethod.Post, "/api/admin/products",
                   JsonContent.Create(product)))
        {
            var response = await _client.SendAsync(duplicateProduct);
            Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
            Assert.Equal("CONCURRENCY_CONFLICT", await ReadCodeAsync(response));
        }

        using (var disable = AuthorizedRequest(token, HttpMethod.Patch,
                   $"/api/admin/categories/{categoryId}/status", JsonContent.Create(new { isActive = false })))
        {
            Assert.Equal(HttpStatusCode.OK, (await _client.SendAsync(disable)).StatusCode);
        }

        var publicResponse = await _client.GetAsync("/api/categories");
        Assert.Equal(HttpStatusCode.OK, publicResponse.StatusCode);
        var publicCategories = await publicResponse.Content.ReadFromJsonAsync<JsonElement>();
        Assert.DoesNotContain(publicCategories.EnumerateArray(), category =>
            category.GetProperty("id").GetGuid() == categoryId);

        using var adminList = AuthorizedRequest(token, HttpMethod.Get, "/api/admin/categories");
        var adminResponse = await _client.SendAsync(adminList);
        var adminCategories = await adminResponse.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Contains(adminCategories.EnumerateArray(), category =>
            category.GetProperty("id").GetGuid() == categoryId);
    }

    [Fact]
    public async Task Concurrent_checkout_of_last_unit_creates_only_one_order()
    {
        var productId = await AddProductAsync(stock: 1, price: 400m);
        var first = await RegisterAndLoginAsync("concurrent-first");
        var second = await RegisterAndLoginAsync("concurrent-second");
        foreach (var token in new[] { first, second })
        {
            using var add = AuthorizedRequest(token, HttpMethod.Post, "/api/cart/items",
                JsonContent.Create(new { productId, quantity = 1 }));
            Assert.Equal(HttpStatusCode.OK, (await _client.SendAsync(add)).StatusCode);
        }

        async Task<HttpStatusCode> CheckoutAsync(string token)
        {
            using var checkout = AuthorizedRequest(token, HttpMethod.Post, "/api/orders",
                JsonContent.Create(new
                {
                    customerName = "Concurrent Buyer",
                    phone = "01700000000",
                    shippingAddress = "House 1, Dhaka",
                    paymentMethod = "CashOnDelivery"
                }));
            return (await _client.SendAsync(checkout)).StatusCode;
        }

        var statuses = await Task.WhenAll(CheckoutAsync(first), CheckoutAsync(second));
        Assert.Contains(HttpStatusCode.Created, statuses);
        Assert.Contains(HttpStatusCode.Conflict, statuses);

        await using var scope = _application.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        Assert.Equal(0, await db.Products.Where(product => product.Id == productId)
            .Select(product => product.StockQuantity).SingleAsync());
        Assert.Equal(1, await db.OrderItems.CountAsync(item => item.ProductId == productId));
    }

    private async Task AddAccountAsync(string email, UserRole role, bool isActive)
    {
        await using var scope = _application.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher<User>>();
        var user = new User
        {
            Name = "Integration Account",
            Email = email,
            Role = role,
            IsActive = isActive
        };
        user.PasswordHash = hasher.HashPassword(user, "SafePass123!");
        db.Users.Add(user);
        await db.SaveChangesAsync();
    }

    private async Task<Guid> AddProductAsync(int stock, decimal price)
    {
        await using var scope = _application.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var category = new Category { Name = "Integration", Slug = $"integration-{Guid.NewGuid():N}" };
        var product = new Product
        {
            Category = category,
            Name = "Integration Product",
            Slug = $"integration-product-{Guid.NewGuid():N}",
            Description = "Created by an isolated integration test.",
            Price = price,
            StockQuantity = stock
        };
        db.Products.Add(product);
        await db.SaveChangesAsync();
        return product.Id;
    }

    private async Task<string> RegisterAndLoginAsync(string marker)
    {
        var email = $"{marker}-{Guid.NewGuid():N}@example.test";
        var password = "SafePass123!";
        var registration = await _client.PostAsJsonAsync("/api/auth/register", new
        {
            name = "Integration Customer",
            email,
            password,
            phone = "01700000000"
        });
        Assert.Equal(HttpStatusCode.Created, registration.StatusCode);

        var login = await _client.PostAsJsonAsync("/api/auth/login", new { email, password });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
        return (await login.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("accessToken").GetString()!;
    }

    private static HttpRequestMessage AuthorizedRequest(
        string token,
        HttpMethod method,
        string path,
        HttpContent? content = null)
    {
        var request = new HttpRequestMessage(method, path) { Content = content };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return request;
    }

    private static async Task<string?> ReadCodeAsync(HttpResponseMessage response)
    {
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        return body.GetProperty("code").GetString();
    }
}
