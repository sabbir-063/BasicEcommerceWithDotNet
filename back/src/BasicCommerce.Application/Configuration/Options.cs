using System.ComponentModel.DataAnnotations;

namespace BasicCommerce.Application.Configuration;

public class JwtOptions
{
    [Required]
    public string Secret { get; set; } = string.Empty;
    
    [Required]
    public string Issuer { get; set; } = string.Empty;
    
    [Required]
    public string Audience { get; set; } = string.Empty;
    
    [Range(1, 1440)]
    public int AccessTokenMinutes { get; set; } = 60;
}

public class CloudinaryOptions
{
    [Required]
    public string CloudName { get; set; } = string.Empty;
    
    [Required]
    public string ApiKey { get; set; } = string.Empty;
    
    [Required]
    public string ApiSecret { get; set; } = string.Empty;
    
    public string Folder { get; set; } = "ecommerce-dev";
}

public class CorsOptions
{
    public string[] AllowedOrigins { get; set; } = Array.Empty<string>();
}

public class SeedOptions
{
    public string? AdminName { get; set; }
    public string? AdminEmail { get; set; }
    public string? AdminPassword { get; set; }
}
