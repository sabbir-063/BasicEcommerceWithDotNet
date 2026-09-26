using BasicCommerce.Application.Contracts;
using BasicCommerce.Domain;
using CloudinaryDotNet;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace BasicCommerce.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration config)
    {
        var connection = config.GetConnectionString("Default") ?? Environment.GetEnvironmentVariable("ConnectionStrings__Default");
        if (string.IsNullOrWhiteSpace(connection)) throw new InvalidOperationException("ConnectionStrings__Default is required.");
        
        services.AddDbContext<AppDbContext>(o => o.UseNpgsql(connection));
        services.AddScoped<IAppDbContext>(sp => sp.GetRequiredService<AppDbContext>());

        services.AddSingleton<IPasswordHasher<User>, PasswordHasher<User>>();

        services.AddSingleton(sp => 
        { 
            var cloudName = config["Cloudinary:CloudName"] ?? Environment.GetEnvironmentVariable("Cloudinary__CloudName") ?? "";
            var apiKey = config["Cloudinary:ApiKey"] ?? Environment.GetEnvironmentVariable("Cloudinary__ApiKey") ?? "";
            var apiSecret = config["Cloudinary:ApiSecret"] ?? Environment.GetEnvironmentVariable("Cloudinary__ApiSecret") ?? "";
            return new Cloudinary(new Account(cloudName, apiKey, apiSecret)); 
        });

        return services;
    }
}
