using BasicCommerce.Application.Configuration;
using BasicCommerce.Application.Contracts;
using BasicCommerce.Application.DTOs;
using BasicCommerce.Application.Exceptions;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Options;

namespace BasicCommerce.Application.Services;

public class MediaService : IMediaService
{
    private readonly Cloudinary _cloudinary;
    private readonly CloudinaryOptions _options;

    public MediaService(Cloudinary cloudinary, IOptions<CloudinaryOptions> options)
    {
        _cloudinary = cloudinary;
        _options = options.Value;
    }

    public async Task<ImageUploadResponse> UploadImageAsync(Stream fileStream, string fileName, string contentType, long fileLength, CancellationToken ct = default)
    {
        if (fileLength == 0 || fileLength > 5 * 1024 * 1024)
            throw new ValidationException("Use an image up to 5 MB.", "UPLOAD_INVALID_TYPE");
            
        var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp" };
        if (!allowedTypes.Contains(contentType.ToLowerInvariant()))
            throw new ValidationException("Use a JPG, PNG or WEBP image.", "UPLOAD_INVALID_TYPE");

        var folder = string.IsNullOrWhiteSpace(_options.Folder) ? "ecommerce-dev" : _options.Folder;
        
        var result = await _cloudinary.UploadAsync(new ImageUploadParams 
        { 
            File = new FileDescription(fileName, fileStream), 
            Folder = folder + "/products", 
            UseFilename = false, 
            UniqueFilename = true 
        });
        
        if (result.Error is not null)
            throw new ValidationException("Cloudinary rejected the image.", "UPLOAD_INVALID_TYPE");
            
        return new ImageUploadResponse(result.SecureUrl?.ToString(), result.PublicId, result.Width, result.Height, result.Format);
    }
}
