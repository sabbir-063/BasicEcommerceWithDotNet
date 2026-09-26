using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BasicCommerce.Application.Configuration;
using BasicCommerce.Application.Contracts;
using BasicCommerce.Domain;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace BasicCommerce.Api.Services;

public class JwtTokenService : ITokenService
{
    private readonly JwtOptions _options;

    public JwtTokenService(IOptions<JwtOptions> options)
    {
        _options = options.Value;
    }

    public (string Token, DateTimeOffset ExpiresAt) GenerateToken(User u)
    {
        var now = DateTime.UtcNow;
        var expires = now.AddMinutes(_options.AccessTokenMinutes);
        
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, u.Id.ToString()),
            new Claim(ClaimTypes.NameIdentifier, u.Id.ToString()),
            new Claim(ClaimTypes.Email, u.Email),
            new Claim(ClaimTypes.Role, u.Role.ToString()),
            new Claim(ClaimTypes.Name, u.Name)
        };
        
        var token = new JwtSecurityToken(
            _options.Issuer, 
            _options.Audience, 
            claims, 
            now, 
            expires, 
            new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.Secret)), 
                SecurityAlgorithms.HmacSha256)
        );
        
        return (new JwtSecurityTokenHandler().WriteToken(token), expires);
    }
}
