using BasicCommerce.Domain;

namespace BasicCommerce.Application.Contracts;

public interface ITokenService
{
    (string Token, DateTimeOffset ExpiresAt) GenerateToken(User user);
}
