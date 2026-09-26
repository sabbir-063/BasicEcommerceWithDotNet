namespace BasicCommerce.Application.DTOs;

public record RegisterRequest(string Name, string Email, string Password, string? Phone);
public record LoginRequest(string Email, string Password);
public record ProfileRequest(string Name, string? Phone);
public record ChangePasswordRequest(string CurrentPassword, string NewPassword);
public record UserDto(Guid Id, string Name, string Email, string? Phone, string Role);
public record AuthResponse(string AccessToken, DateTimeOffset ExpiresAt, UserDto User);
