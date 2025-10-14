using Microsoft.AspNetCore.Mvc;
using Realstate_servcices.Server.Dto.Property;
using Realstate_servcices.Server.Services.PropertyCreation;
using Realstate_servcices.Server.Utilities.Storage;

namespace Realstate_servcices.Server.Controllers.Agent
{
    [ApiController]
    [Route("api/[controller]")]
    public class CreationPropertyController : ControllerBase
    {
        private readonly ICreatePropertyService _propertyService;
        private readonly ILocalstorageImage _imageStorage;
        private readonly ILocalStorageVideo _videoStorage;

        public CreationPropertyController(
            ICreatePropertyService propertyService,
            ILocalstorageImage imageStorage,
            ILocalStorageVideo videoStorage)
        {
            _propertyService = propertyService;
            _imageStorage = imageStorage;
            _videoStorage = videoStorage;
        }

        [HttpPost]
        public async Task<ActionResult<PropertyResponse>> CreateProperty([FromBody] CreatePropertyRequest request)
        {
            var result = await _propertyService.CreatePropertyAsync(request);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return CreatedAtAction(nameof(GetProperty), new { id = result.Property?.Id }, result);
        }

        [HttpPost("with-images")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<PropertyResponse>> CreatePropertyWithImages(
            [FromForm] string propertyData,
            [FromForm] List<IFormFile>? images = null)
        {
            try
            {
                Console.WriteLine($"Received property data: {propertyData}");
                Console.WriteLine($"Received images count: {images?.Count ?? 0}");

                if (string.IsNullOrEmpty(propertyData))
                {
                    return BadRequest(new PropertyResponse
                    {
                        Success = false,
                        Message = "Property data is required"
                    });
                }

                var request = System.Text.Json.JsonSerializer.Deserialize<CreatePropertyRequest>(
                    propertyData,
                    new System.Text.Json.JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

                if (request == null)
                {
                    return BadRequest(new PropertyResponse
                    {
                        Success = false,
                        Message = "Invalid property data format"
                    });
                }

                List<string> imageUrls = new List<string>();

                // Upload images
                if (images != null && images.Any())
                {
                    Console.WriteLine($"Uploading {images.Count} images...");
                    imageUrls = await _imageStorage.UploadMultipleImagesAsync(images);
                    Console.WriteLine($"Uploaded {imageUrls.Count} images successfully");
                }

                request.ImageUrls = imageUrls;

                Console.WriteLine($"Calling CreatePropertyAsync with Property: {request.Property?.Title}");
                var result = await _propertyService.CreatePropertyAsync(request);

                if (!result.Success)
                {
                    return BadRequest(result);
                }

                return CreatedAtAction(nameof(GetProperty), new { id = result.Property?.Id }, result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in CreatePropertyWithImages: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return BadRequest(new PropertyResponse
                {
                    Success = false,
                    Message = $"Failed to create property with images: {ex.Message}",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        [HttpPost("with-videos")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<PropertyResponse>> CreatePropertyWithVideos(
            [FromForm] string propertyData,
            [FromForm] List<IFormFile>? videos = null)
        {
            try
            {
                Console.WriteLine($"Received property data: {propertyData}");
                Console.WriteLine($"Received videos count: {videos?.Count ?? 0}");

                if (string.IsNullOrEmpty(propertyData))
                {
                    return BadRequest(new PropertyResponse
                    {
                        Success = false,
                        Message = "Property data is required"
                    });
                }

                var request = System.Text.Json.JsonSerializer.Deserialize<CreatePropertyRequest>(
                    propertyData,
                    new System.Text.Json.JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

                if (request == null)
                {
                    return BadRequest(new PropertyResponse
                    {
                        Success = false,
                        Message = "Invalid property data format"
                    });
                }

                List<string> videoUrls = new List<string>();

                // Upload videos
                if (videos != null && videos.Any())
                {
                    Console.WriteLine($"Uploading {videos.Count} videos...");
                    videoUrls = await _videoStorage.UploadMultipleVideosAsync(videos);
                    Console.WriteLine($"Uploaded {videoUrls.Count} videos successfully");
                }

                request.VideoUrls = videoUrls;

                Console.WriteLine($"Calling CreatePropertyAsync with Property: {request.Property?.Title}");
                var result = await _propertyService.CreatePropertyAsync(request);

                if (!result.Success)
                {
                    return BadRequest(result);
                }

                return CreatedAtAction(nameof(GetProperty), new { id = result.Property?.Id }, result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in CreatePropertyWithVideos: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return BadRequest(new PropertyResponse
                {
                    Success = false,
                    Message = $"Failed to create property with videos: {ex.Message}",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        [HttpPost("with-media")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<PropertyResponse>> CreatePropertyWithMedia(
            [FromForm] string propertyData,
            [FromForm] List<IFormFile>? images = null,
            [FromForm] List<IFormFile>? videos = null)
        {
            try
            {
                Console.WriteLine($"Received property data: {propertyData}");
                Console.WriteLine($"Received images count: {images?.Count ?? 0}");
                Console.WriteLine($"Received videos count: {videos?.Count ?? 0}");

                if (string.IsNullOrEmpty(propertyData))
                {
                    return BadRequest(new PropertyResponse
                    {
                        Success = false,
                        Message = "Property data is required"
                    });
                }

                var request = System.Text.Json.JsonSerializer.Deserialize<CreatePropertyRequest>(
                    propertyData,
                    new System.Text.Json.JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

                if (request == null)
                {
                    return BadRequest(new PropertyResponse
                    {
                        Success = false,
                        Message = "Invalid property data format"
                    });
                }

                List<string> imageUrls = new List<string>();
                List<string> videoUrls = new List<string>();

                // Upload images
                if (images != null && images.Any())
                {
                    Console.WriteLine($"Uploading {images.Count} images...");
                    imageUrls = await _imageStorage.UploadMultipleImagesAsync(images);
                    Console.WriteLine($"Uploaded {imageUrls.Count} images successfully");
                }

                // Upload videos
                if (videos != null && videos.Any())
                {
                    Console.WriteLine($"Uploading {videos.Count} videos...");
                    videoUrls = await _videoStorage.UploadMultipleVideosAsync(videos);
                    Console.WriteLine($"Uploaded {videoUrls.Count} videos successfully");
                }

                request.ImageUrls = imageUrls;
                request.VideoUrls = videoUrls;

                Console.WriteLine($"Calling CreatePropertyAsync with Property: {request.Property?.Title}");
                var result = await _propertyService.CreatePropertyAsync(request);

                if (!result.Success)
                {
                    return BadRequest(result);
                }

                return CreatedAtAction(nameof(GetProperty), new { id = result.Property?.Id }, result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in CreatePropertyWithMedia: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return BadRequest(new PropertyResponse
                {
                    Success = false,
                    Message = $"Failed to create property with media: {ex.Message}",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        [HttpPut("with-images/{id}")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<PropertyResponse>> UpdatePropertyWithImages(
            int id,
            [FromForm] string propertyData,
            [FromForm] List<IFormFile>? images = null)
        {
            try
            {
                if (string.IsNullOrEmpty(propertyData))
                {
                    return BadRequest(new PropertyResponse
                    {
                        Success = false,
                        Message = "Property data is required"
                    });
                }

                var request = System.Text.Json.JsonSerializer.Deserialize<UpdatePropertyRequest>(
                    propertyData,
                    new System.Text.Json.JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

                if (request == null)
                {
                    return BadRequest(new PropertyResponse
                    {
                        Success = false,
                        Message = "Invalid property data"
                    });
                }

                List<string> imageUrls = new List<string>();

                if (images != null && images.Any())
                {
                    imageUrls = await _imageStorage.UploadMultipleImagesAsync(images);
                }

                request.ImageUrls = imageUrls;

                var result = await _propertyService.UpdatePropertyAsync(id, request);

                if (!result.Success)
                {
                    return BadRequest(result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new PropertyResponse
                {
                    Success = false,
                    Message = $"Failed to update property with images: {ex.Message}",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        [HttpPut("with-videos/{id}")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<PropertyResponse>> UpdatePropertyWithVideos(
            int id,
            [FromForm] string propertyData,
            [FromForm] List<IFormFile>? videos = null)
        {
            try
            {
                if (string.IsNullOrEmpty(propertyData))
                {
                    return BadRequest(new PropertyResponse
                    {
                        Success = false,
                        Message = "Property data is required"
                    });
                }

                var request = System.Text.Json.JsonSerializer.Deserialize<UpdatePropertyRequest>(
                    propertyData,
                    new System.Text.Json.JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

                if (request == null)
                {
                    return BadRequest(new PropertyResponse
                    {
                        Success = false,
                        Message = "Invalid property data"
                    });
                }

                List<string> videoUrls = new List<string>();

                if (videos != null && videos.Any())
                {
                    videoUrls = await _videoStorage.UploadMultipleVideosAsync(videos);
                }

                request.VideoUrls = videoUrls;

                var result = await _propertyService.UpdatePropertyAsync(id, request);

                if (!result.Success)
                {
                    return BadRequest(result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new PropertyResponse
                {
                    Success = false,
                    Message = $"Failed to update property with videos: {ex.Message}",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        [HttpPut("with-media/{id}")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<PropertyResponse>> UpdatePropertyWithMedia(
            int id,
            [FromForm] string propertyData,
            [FromForm] List<IFormFile>? images = null,
            [FromForm] List<IFormFile>? videos = null)
        {
            try
            {
                if (string.IsNullOrEmpty(propertyData))
                {
                    return BadRequest(new PropertyResponse
                    {
                        Success = false,
                        Message = "Property data is required"
                    });
                }

                var request = System.Text.Json.JsonSerializer.Deserialize<UpdatePropertyRequest>(
                    propertyData,
                    new System.Text.Json.JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

                if (request == null)
                {
                    return BadRequest(new PropertyResponse
                    {
                        Success = false,
                        Message = "Invalid property data"
                    });
                }

                List<string> imageUrls = new List<string>();
                List<string> videoUrls = new List<string>();

                if (images != null && images.Any())
                {
                    imageUrls = await _imageStorage.UploadMultipleImagesAsync(images);
                }

                if (videos != null && videos.Any())
                {
                    videoUrls = await _videoStorage.UploadMultipleVideosAsync(videos);
                }

                request.ImageUrls = imageUrls;
                request.VideoUrls = videoUrls;

                var result = await _propertyService.UpdatePropertyAsync(id, request);

                if (!result.Success)
                {
                    return BadRequest(result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new PropertyResponse
                {
                    Success = false,
                    Message = $"Failed to update property with media: {ex.Message}",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        [HttpPost("upload-images")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult> UploadImages(List<IFormFile> files)
        {
            try
            {
                if (files == null || !files.Any())
                {
                    return BadRequest(new { success = false, message = "No files provided" });
                }

                var uploadedUrls = await _imageStorage.UploadMultipleImagesAsync(files);

                return Ok(new
                {
                    success = true,
                    message = "Images uploaded successfully",
                    imageUrls = uploadedUrls
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = $"Failed to upload images: {ex.Message}"
                });
            }
        }

        [HttpPost("upload-videos")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult> UploadVideos(List<IFormFile> files)
        {
            try
            {
                if (files == null || !files.Any())
                {
                    return BadRequest(new { success = false, message = "No files provided" });
                }

                var uploadedUrls = await _videoStorage.UploadMultipleVideosAsync(files);

                return Ok(new
                {
                    success = true,
                    message = "Videos uploaded successfully",
                    videoUrls = uploadedUrls
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = $"Failed to upload videos: {ex.Message}"
                });
            }
        }

        [HttpDelete("image/{imageUrl}")]
        public async Task<ActionResult> DeleteImage(string imageUrl)
        {
            try
            {
                if (string.IsNullOrEmpty(imageUrl))
                {
                    return BadRequest(new { success = false, message = "Image URL is required" });
                }

                var result = await _imageStorage.DeleteImageAsync(imageUrl);

                if (!result)
                {
                    return NotFound(new { success = false, message = "Image not found or could not be deleted" });
                }

                return Ok(new { success = true, message = "Image deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = $"Failed to delete image: {ex.Message}"
                });
            }
        }

        [HttpDelete("video/{videoUrl}")]
        public async Task<ActionResult> DeleteVideo(string videoUrl)
        {
            try
            {
                if (string.IsNullOrEmpty(videoUrl))
                {
                    return BadRequest(new { success = false, message = "Video URL is required" });
                }

                var result = await _videoStorage.DeleteVideoAsync(videoUrl);

                if (!result)
                {
                    return NotFound(new { success = false, message = "Video not found or could not be deleted" });
                }

                return Ok(new { success = true, message = "Video deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = $"Failed to delete video: {ex.Message}"
                });
            }
        }

        [HttpGet("video-info")]
        public async Task<ActionResult> GetVideoInfo([FromQuery] string videoUrl)
        {
            try
            {
                if (string.IsNullOrEmpty(videoUrl))
                {
                    return BadRequest(new { success = false, message = "Video URL is required" });
                }

                var duration = await _videoStorage.GetVideoDurationAsync(videoUrl);
                var size = await _videoStorage.GetVideoSizeAsync(videoUrl);

                return Ok(new
                {
                    success = true,
                    duration,
                    size
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = $"Failed to get video info: {ex.Message}"
                });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PropertyResponse>> GetProperty(int id)
        {
            var result = await _propertyService.GetPropertyByIdAsync(id);

            if (!result.Success)
            {
                return NotFound(result);
            }

            return Ok(result);
        }

        [HttpGet]
        public async Task<ActionResult<PropertiesResponse>> GetAllProperties()
        {
            var result = await _propertyService.GetAllPropertiesAsync();
            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpGet("owner/{ownerId}")]
        public async Task<ActionResult<PropertiesResponse>> GetPropertiesByOwner(int ownerId)
        {
            var result = await _propertyService.GetPropertiesByOwnerIdAsync(ownerId);
            return Ok(result);
        }

        [HttpGet("agent/{agentId}")]
        public async Task<ActionResult<PropertiesResponse>> GetPropertiesByAgent(int agentId)
        {
            var result = await _propertyService.GetPropertiesByAgentIdAsync(agentId);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<PropertyResponse>> UpdateProperty(int id, [FromBody] UpdatePropertyRequest request)
        {
            var result = await _propertyService.UpdatePropertyAsync(id, request);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<PropertyResponse>> DeleteProperty(int id)
        {
            var result = await _propertyService.DeletePropertyAsync(id);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpGet("status/{status}")]
        public async Task<ActionResult<PropertiesResponse>> GetPropertiesByStatus(string status)
        {
            try
            {
                var result = await _propertyService.GetPropertiesByStatusAsync(status);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new PropertiesResponse
                {
                    Success = false,
                    Message = ex.Message
                });
            }
        }

        [HttpGet("search")]
        public async Task<ActionResult<PropertiesResponse>> SearchProperties([FromQuery] string q)
        {
            try
            {
                var result = await _propertyService.SearchPropertiesAsync(q);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new PropertiesResponse
                {
                    Success = false,
                    Message = ex.Message
                });
            }
        }
    }
}