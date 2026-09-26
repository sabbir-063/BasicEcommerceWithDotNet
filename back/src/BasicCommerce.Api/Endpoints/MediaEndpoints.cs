using BasicCommerce.Application.Contracts;
using BasicCommerce.Application.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BasicCommerce.Api.Endpoints;

public static class MediaEndpoints
{
    public static void MapMediaEndpoints(this IEndpointRouteBuilder app)
    {
        var adminGroup = app.MapGroup("/api/admin/media").RequireAuthorization("Admin").WithTags("Admin Media");

        adminGroup.MapPost("/images", async (HttpRequest request, [FromServices] IMediaService mediaService, CancellationToken ct) => 
        {
            if (!request.HasFormContentType) 
                throw new ValidationException("Multipart form data is required.", "UPLOAD_INVALID_TYPE");
                
            var form = await request.ReadFormAsync(ct);
            var file = form.Files.GetFile("file");
            if (file is null)
                throw new ValidationException("Use an image up to 5 MB.", "UPLOAD_INVALID_TYPE");
                
            var response = await mediaService.UploadImageAsync(
                file.OpenReadStream(), 
                file.FileName, 
                file.ContentType, 
                file.Length, 
                ct);
            return Results.Created("/api/admin/media/images", response);
        });
    }
}
