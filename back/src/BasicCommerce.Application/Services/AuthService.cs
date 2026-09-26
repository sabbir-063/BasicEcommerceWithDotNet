using BasicCommerce.Application.Contracts;
using BasicCommerce.Application.DTOs;
using BasicCommerce.Application.Exceptions;
using BasicCommerce.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace BasicCommerce.Application.Services;

public class AuthService : IAuthService
{
    private readonly IAppDbContext _db;
    private readonly IPasswordHasher<User> _hasher;
    private readonly ITokenService _tokenService;

    public AuthService(IAppDbContext db, IPasswordHasher<User> hasher, ITokenService tokenService)
    {
        _db = db;
        _hasher = hasher;
        _tokenService = tokenService;
    }

    public async Task<UserDto> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Email) || request.Password.Length < 8)
            throw new ValidationException("Name, email and an 8+ character password are required.");

        var email = request.Email.Trim().ToLowerInvariant();
        if (await _db.Users.AnyAsync(x => x.Email == email, ct))
            throw new ConflictException("Choose a different email.", "EMAIL_ALREADY_EXISTS");

        var u = new User { Name = request.Name.Trim(), Email = email, Phone = request.Phone?.Trim() };
        u.PasswordHash = _hasher.HashPassword(u, request.Password);
        _db.Users.Add(u);
        await _db.SaveChangesAsync(ct);
        
        return UserToDto(u);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var u = await _db.Users.SingleOrDefaultAsync(x => x.Email == email, ct);
        
        if (u is null || _hasher.VerifyHashedPassword(u, u.PasswordHash, request.Password) == PasswordVerificationResult.Failed)
            throw new UnauthorizedException("Email or password is incorrect.", "INVALID_CREDENTIALS");
            
        if (!u.IsActive)
            throw new UnauthorizedException("This account is inactive.", "ACCOUNT_INACTIVE");

        var tokenInfo = _tokenService.GenerateToken(u);
        return new AuthResponse(tokenInfo.Token, tokenInfo.ExpiresAt, UserToDto(u));
    }

    public async Task<UserDto> GetProfileAsync(Guid userId, CancellationToken ct = default)
    {
        var u = await _db.Users.SingleOrDefaultAsync(x => x.Id == userId, ct);
        if (u is null) throw new UnauthorizedException("Sign in is required.", "INVALID_CREDENTIALS");
        return UserToDto(u);
    }

    public async Task<UserDto> UpdateProfileAsync(Guid userId, ProfileRequest request, CancellationToken ct = default)
    {
        var u = await _db.Users.SingleOrDefaultAsync(x => x.Id == userId, ct);
        if (u is null) throw new UnauthorizedException("Sign in is required.", "INVALID_CREDENTIALS");
        
        if (string.IsNullOrWhiteSpace(request.Name))
            throw new ValidationException("Name is required.");
            
        u.Name = request.Name.Trim();
        u.Phone = request.Phone?.Trim();
        await _db.SaveChangesAsync(ct);
        
        return UserToDto(u);
    }

    public async Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken ct = default)
    {
        var u = await _db.Users.SingleOrDefaultAsync(x => x.Id == userId, ct);
        if (u is null) throw new UnauthorizedException("Sign in is required.", "INVALID_CREDENTIALS");
        
        if (_hasher.VerifyHashedPassword(u, u.PasswordHash, request.CurrentPassword) == PasswordVerificationResult.Failed || request.NewPassword.Length < 8)
            throw new ValidationException("Password requirements were not met.");
            
        u.PasswordHash = _hasher.HashPassword(u, request.NewPassword);
        await _db.SaveChangesAsync(ct);
    }

    private static UserDto UserToDto(User u) => new(u.Id, u.Name, u.Email, u.Phone, u.Role.ToString());
}
