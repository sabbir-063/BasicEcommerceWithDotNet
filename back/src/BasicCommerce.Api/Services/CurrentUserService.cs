using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using BasicCommerce.Application.Contracts;
using BasicCommerce.Domain;
using BasicCommerce.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace BasicCommerce.Api.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly AppDbContext _db;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor, AppDbContext db)
    {
        _httpContextAccessor = httpContextAccessor;
        _db = db;
    }

    public Guid GetUserId()
    {
        var cp = _httpContextAccessor.HttpContext?.User;
        if (cp is null) throw new Application.Exceptions.UnauthorizedException("User is not authenticated.");
        
        var idString = cp.FindFirstValue(ClaimTypes.NameIdentifier) ?? cp.FindFirstValue(JwtRegisteredClaimNames.Sub);
        if (string.IsNullOrWhiteSpace(idString) || !Guid.TryParse(idString, out var uid))
            throw new Application.Exceptions.UnauthorizedException("Invalid token.");

        return uid;
    }

    public async Task<User?> GetUserAsync(CancellationToken ct = default)
    {
        var uid = GetUserId();
        return await _db.Users.SingleOrDefaultAsync(x => x.Id == uid, ct);
    }
}
