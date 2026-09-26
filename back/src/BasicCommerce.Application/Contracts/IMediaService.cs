using BasicCommerce.Application.DTOs;

namespace BasicCommerce.Application.Contracts;

public interface IMediaService
{
    Task<ImageUploadResponse> UploadImageAsync(Stream fileStream, string fileName, string contentType, long fileLength, CancellationToken ct = default);
    Task DeleteImageAsync(string publicId, CancellationToken ct = default);
}
