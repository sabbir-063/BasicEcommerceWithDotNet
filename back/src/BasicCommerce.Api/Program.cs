using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;
using BasicCommerce.Domain;
using BasicCommerce.Infrastructure;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

using BasicCommerce.Api.Endpoints;
using BasicCommerce.Api.Services;
using BasicCommerce.Api.Infrastructure;
using BasicCommerce.Application.Configuration;
using BasicCommerce.Application.Contracts;
using BasicCommerce.Application.Services;
using BasicCommerce.Application;
// Keep rest of Program.cs exactly the same up to builder.Services.AddDbContext...

var localEnvFile = FindLocalEnvFile();
if (localEnvFile is not null) LoadDotEnv(localEnvFile);

var builder = WebApplication.CreateBuilder(args);
if (int.TryParse(Environment.GetEnvironmentVariable("PORT"), out var renderPort)) builder.WebHost.UseUrls($"http://0.0.0.0:{renderPort}");
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddProblemDetails();

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddExceptionHandler<ConcurrencyExceptionHandler>();
builder.Services.ConfigureHttpJsonOptions(o => o.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddHealthChecks();
builder.Services.AddHttpContextAccessor();

builder.Services.AddInfrastructureServices(builder.Configuration);
builder.Services.AddApplicationServices(builder.Configuration);

builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<ITokenService, JwtTokenService>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o => { });

builder.Services.AddOptions<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme)
    .Configure<IConfiguration>((o, config) =>
    {
        var secret = config["Jwt:Secret"] ?? Environment.GetEnvironmentVariable("Jwt__Secret") ?? throw new InvalidOperationException("Jwt secret missing");
        var issuer = config["Jwt:Issuer"] ?? Environment.GetEnvironmentVariable("Jwt__Issuer") ?? "BasicCommerce.Api";
        var audience = config["Jwt:Audience"] ?? Environment.GetEnvironmentVariable("Jwt__Audience") ?? "BasicCommerce.Frontend";

        o.TokenValidationParameters = new TokenValidationParameters 
        { 
            ValidateIssuer = true, 
            ValidateAudience = true, 
            ValidateLifetime = true, 
            ValidateIssuerSigningKey = true, 
            ValidIssuer = issuer, 
            ValidAudience = audience, 
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)), 
            ClockSkew = TimeSpan.FromSeconds(30) 
        };
    });
builder.Services.AddAuthorization(o => o.AddPolicy("Admin", p => p.RequireRole("Admin")));
var origins = (Environment.GetEnvironmentVariable("Cors__AllowedOrigins__0") ?? "http://localhost:5173")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    .Select(origin => origin.TrimEnd('/'))
    .Distinct(StringComparer.OrdinalIgnoreCase)
    .ToArray();
builder.Services.AddCors(o => o.AddDefaultPolicy(p => p.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod()));
var app = builder.Build();
app.UseExceptionHandler(); app.UseCors(); if (app.Environment.IsDevelopment()) { app.UseSwagger(); app.UseSwaggerUI(); }
app.UseAuthentication(); app.UseAuthorization();
app.MapHealthChecks("/health/live");
app.MapGet("/health/ready", async (AppDbContext db) => await db.Database.CanConnectAsync() ? Results.Ok(new { status = "ready" }) : Results.StatusCode(503));
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
    if (app.Environment.IsDevelopment())
        await SeedAsync(db, scope.ServiceProvider.GetRequiredService<IPasswordHasher<User>>(), builder.Configuration);
}

app.MapAuthEndpoints();

app.MapCategoryEndpoints();

app.MapProductEndpoints();
app.MapMediaEndpoints();

app.MapCartEndpoints();

app.MapOrderEndpoints();
app.Run();
static string Slug(string v) => string.Join('-', v.ToLowerInvariant().Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)).Replace("/", "-");
static string? FindLocalEnvFile()
{
    var current = Directory.GetCurrentDirectory();
    foreach (var candidate in new[] { Path.Combine(current, ".env"), Path.Combine(current, "back", ".env") })
        if (File.Exists(candidate)) return candidate;

    for (var directory = new DirectoryInfo(AppContext.BaseDirectory); directory is not null; directory = directory.Parent)
        if (File.Exists(Path.Combine(directory.FullName, "BasicCommerce.sln")))
        {
            var candidate = Path.Combine(directory.FullName, ".env");
            return File.Exists(candidate) ? candidate : null;
        }

    return null;
}
static void LoadDotEnv(string path)
{
    foreach (var rawLine in File.ReadLines(path))
    {
        var line = rawLine.Trim();
        if (line.Length == 0 || line.StartsWith('#')) continue;
        var separator = line.IndexOf('=');
        if (separator <= 0) continue;
        var key = line[..separator].Trim();
        var value = line[(separator + 1)..].Trim();
        if (value.Length >= 2 && ((value[0] == '"' && value[^1] == '"') || (value[0] == '\'' && value[^1] == '\'')))
            value = value[1..^1];
        if (string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable(key)))
            Environment.SetEnvironmentVariable(key, value);
    }
}
static async Task SeedAsync(AppDbContext db, IPasswordHasher<User> hasher, IConfiguration config) { var email = config["Seed:AdminEmail"] ?? Environment.GetEnvironmentVariable("Seed__AdminEmail"); var password = config["Seed:AdminPassword"] ?? Environment.GetEnvironmentVariable("Seed__AdminPassword"); if (!string.IsNullOrWhiteSpace(email) && !string.IsNullOrWhiteSpace(password) && !await db.Users.AnyAsync(x => x.Email == email.ToLowerInvariant())) { var a = new User { Name = config["Seed:AdminName"] ?? Environment.GetEnvironmentVariable("Seed__AdminName") ?? "Development Admin", Email = email.ToLowerInvariant(), Role = UserRole.Admin }; a.PasswordHash = hasher.HashPassword(a, password); db.Users.Add(a); } foreach (var n in new[] { "Electronics", "Accessories", "Home & Living", "Personal Care" }) { var slug = Slug(n); if (!await db.Categories.AnyAsync(x => x.Slug == slug)) db.Categories.Add(new Category { Name = n, Slug = slug }); } await db.SaveChangesAsync(); if (await db.Products.AnyAsync()) return; var cats = await db.Categories.ToDictionaryAsync(x => x.Slug); foreach (var (name, cat, price, stock) in new[] { ("Wireless Headphones", "electronics", 3499m, 12), ("Portable Bluetooth Speaker", "electronics", 2499m, 8), ("Everyday Backpack", "accessories", 1890m, 15), ("Minimal Wrist Watch", "accessories", 5990m, 3), ("Modern Desk Lamp", "home-&-living", 1290m, 10), ("Ceramic Coffee Mug", "home-&-living", 890m, 20), ("Daily Skin Care Set", "personal-care", 1590m, 7), ("Travel Toiletry Kit", "personal-care", 990m, 0) }) db.Products.Add(new Product { CategoryId = cats[cat].Id, Name = name, Slug = Slug(name), Description = $"Thoughtfully designed {name.ToLowerInvariant()} for everyday use.", Price = price, StockQuantity = stock }); await db.SaveChangesAsync(); }

public partial class Program;
