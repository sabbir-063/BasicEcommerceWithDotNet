using System.Security.Claims;
using BasicCommerce.Domain;

namespace BasicCommerce.Application.Contracts;

public interface ICurrentUserService
{
    Guid GetUserId();
    Task<User?> GetUserAsync(CancellationToken ct = default);
}
