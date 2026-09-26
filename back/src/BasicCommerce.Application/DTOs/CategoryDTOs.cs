namespace BasicCommerce.Application.DTOs;

public record CategoryDto(Guid Id, string Name, string Slug, bool IsActive);
public record CategoryRequest(string Name);
public record StatusRequest(bool IsActive);
