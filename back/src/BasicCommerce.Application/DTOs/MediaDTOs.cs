using Microsoft.AspNetCore.Http;

namespace BasicCommerce.Application.DTOs;

public record ImageUploadResponse(string? Url, string? PublicId, int Width, int Height, string? Format);
