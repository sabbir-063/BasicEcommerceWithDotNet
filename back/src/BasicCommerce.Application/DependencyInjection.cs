using BasicCommerce.Application.Configuration;
using BasicCommerce.Application.Contracts;
using BasicCommerce.Application.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace BasicCommerce.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration config)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<IMediaService, MediaService>();
        services.AddScoped<ICartService, CartService>();
        services.AddScoped<IOrderService, OrderService>();

        services.AddOptions<JwtOptions>().Configure<IConfiguration>((options, c) =>
        {
            options.Secret = c["Jwt:Secret"] ?? Environment.GetEnvironmentVariable("Jwt__Secret") ?? throw new InvalidOperationException("Jwt secret missing");
            options.Issuer = c["Jwt:Issuer"] ?? Environment.GetEnvironmentVariable("Jwt__Issuer") ?? "BasicCommerce.Api";
            options.Audience = c["Jwt:Audience"] ?? Environment.GetEnvironmentVariable("Jwt__Audience") ?? "BasicCommerce.Frontend";
            options.AccessTokenMinutes = int.TryParse(c["Jwt:AccessTokenMinutes"] ?? Environment.GetEnvironmentVariable("Jwt__AccessTokenMinutes"), out var tm) ? tm : 60;
        });

        return services;
    }
}
