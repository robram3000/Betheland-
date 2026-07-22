using Realstate_servcices.Server.Dto.Property;
using Realstate_servcices.Server.Entity.Properties;
using Realstate_servcices.Server.Repository.Properties;
using Realstate_servcices.Server.Services.PropertyCreation.Interfaces;
using Realstate_servcices.Server.Utilities.Storage.Interfaces;
namespace Realstate_servcices.Server.Services.PropertyCreation
{
    public class CreatePropertyService : ICreatePropertyService
    {
        private readonly ICreatePropertyRepository _propertyRepository;
        private readonly ILocalstorageImage _imageStorage;
        private readonly ILocalStorageVideo _videoStorage;
        private readonly ILogger<CreatePropertyService> _logger;

        /// <summary>
        /// Initializes a new instance of the CreatePropertyService class
        /// </summary>
        /// <param name="propertyRepository">The repository for property data operations</param>
        /// <param name="imageStorage">The service for image storage operations</param>
        /// <param name="videoStorage">The service for video storage operations</param>
        /// <param name="logger">The logger for tracking service operations</param>
        public CreatePropertyService(
            ICreatePropertyRepository propertyRepository,
            ILocalstorageImage imageStorage,
            ILocalStorageVideo videoStorage,
            ILogger<CreatePropertyService> logger)
        {
            _propertyRepository = propertyRepository;
            _imageStorage = imageStorage;
            _videoStorage = videoStorage;
            _logger = logger;
        }

        /// <summary>
        /// Creates a new property with the provided details
        /// </summary>
        /// <param name="request">The property creation request containing property data, images, and videos</param>
        /// <returns>A response indicating success or failure with the created property details</returns>
        public async Task<PropertyResponse> CreatePropertyAsync(CreatePropertyRequest request)
        {
            try
            {
                _logger.LogInformation("Creating new property: {PropertyTitle}", request.Property.Title);
                _logger.LogInformation("Property Data: {@PropertyData}", request.Property);
                _logger.LogInformation("Image URLs count: {ImageCount}", request.ImageUrls?.Count ?? 0);
                _logger.LogInformation("Video URLs count: {VideoCount}", request.VideoUrls?.Count ?? 0);

                // Log all property fields to identify which ones are null
                _logger.LogInformation("Property Details - Title: {Title}, Type: {Type}, Price: {Price}, Bedrooms: {Bedrooms}, Bathrooms: {Bathrooms}",
                    request.Property.Title, request.Property.Type, request.Property.Price, request.Property.Bedrooms, request.Property.Bathrooms);

                _logger.LogInformation("Address Details - Address: {Address}, City: {City}, State: {State}, Zip: {ZipCode}, Barangay: {Barangay}",
                    request.Property.Address, request.Property.City, request.Property.State, request.Property.ZipCode, request.Property.Barangay);

                // Validate owner exists if provided
                if (request.Property.OwnerId.HasValue && request.Property.OwnerId > 0)
                {
                    var ownerExists = await _propertyRepository.OwnerExistsAsync(request.Property.OwnerId.Value);
                    if (!ownerExists)
                    {
                        return new PropertyResponse
                        {
                            Success = false,
                            Message = "Specified owner does not exist",
                            Errors = new List<string> { "Invalid OwnerId" }
                        };
                    }
                }

                var property = MapToPropertyEntity(request.Property);

                // Log the mapped entity before saving
                _logger.LogInformation("Mapped Property Entity: {@PropertyEntity}", property);

                // Create property first
                var createdProperty = await _propertyRepository.CreatePropertyAsync(property);
                _logger.LogInformation("Property created with ID: {PropertyId}", createdProperty.Id);

                // Handle images
                if (request.ImageUrls != null && request.ImageUrls.Any())
                {
                    _logger.LogInformation("Adding {ImageCount} images to property", request.ImageUrls.Count);
                    var propertyImages = request.ImageUrls.Select(url => new PropertyImage
                    {
                        PropertyId = createdProperty.Id,
                        ImageUrl = url,
                        CreatedAt = DateTime.UtcNow
                    }).ToList();

                    await _propertyRepository.AddPropertyImagesAsync(createdProperty.Id, propertyImages);
                    _logger.LogInformation("Successfully added {ImageCount} images", propertyImages.Count);
                }

                // Handle videos
                if (request.VideoUrls != null && request.VideoUrls.Any())
                {
                    _logger.LogInformation("Adding {VideoCount} videos to property", request.VideoUrls.Count);
                    var propertyVideos = new List<PropertyVideo>();

                    foreach (var videoUrl in request.VideoUrls)
                    {
                        _logger.LogInformation("Processing video: {VideoUrl}", videoUrl);
                        var videoSize = await _videoStorage.GetVideoSizeAsync(videoUrl);
                        var videoDuration = await _videoStorage.GetVideoDurationAsync(videoUrl);

                        var video = new PropertyVideo
                        {
                            PropertyId = createdProperty.Id,
                            VideoUrl = videoUrl,
                            VideoName = Path.GetFileName(videoUrl),
                            FileSize = videoSize,
                            Duration = videoDuration,
                            CreatedAt = DateTime.UtcNow
                        };
                        propertyVideos.Add(video);
                        _logger.LogInformation("Created video entity: {VideoName}", video.VideoName);
                    }

                    await _propertyRepository.AddPropertyVideosAsync(createdProperty.Id, propertyVideos);
                    _logger.LogInformation("Successfully added {VideoCount} videos", propertyVideos.Count);
                }

                // Get the complete property with relationships
                var completeProperty = await _propertyRepository.GetPropertyByIdAsync(createdProperty.Id);
                var propertyDto = MapToPropertyDto(completeProperty!);

                _logger.LogInformation("Property creation completed successfully. Total images: {ImageCount}, Total videos: {VideoCount}",
                    propertyDto.PropertyImages?.Count ?? 0, propertyDto.PropertyVideos?.Count ?? 0);

                return new PropertyResponse
                {
                    Success = true,
                    Message = "Property created successfully",
                    Property = propertyDto
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating property: {PropertyTitle}", request.Property.Title);
                return new PropertyResponse
                {
                    Success = false,
                    Message = $"Failed to create property: {ex.Message}",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        /// <summary>
        /// Retrieves a property by its unique identifier
        /// </summary>
        /// <param name="id">The unique identifier of the property to retrieve</param>
        /// <returns>A response containing the property details or an error message</returns>
        public async Task<PropertyResponse> GetPropertyByIdAsync(int id)
        {
            try
            {
                _logger.LogInformation("Retrieving property with ID: {PropertyId}", id);

                var property = await _propertyRepository.GetPropertyByIdAsync(id);
                if (property == null)
                {
                    return new PropertyResponse
                    {
                        Success = false,
                        Message = "Property not found",
                        Errors = new List<string> { $"Property with ID {id} not found" }
                    };
                }

                var propertyDto = MapToPropertyDto(property);
                _logger.LogInformation("Retrieved property with {ImageCount} images and {VideoCount} videos",
                    propertyDto.PropertyImages?.Count ?? 0, propertyDto.PropertyVideos?.Count ?? 0);

                return new PropertyResponse
                {
                    Success = true,
                    Message = "Property retrieved successfully",
                    Property = propertyDto
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving property with ID: {PropertyId}", id);
                return new PropertyResponse
                {
                    Success = false,
                    Message = $"Failed to retrieve property: {ex.Message}",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        /// <summary>
        /// Retrieves all properties from the system
        /// </summary>
        /// <returns>A response containing all properties or an error message</returns>
        public async Task<PropertiesResponse> GetAllPropertiesAsync()
        {
            try
            {
                _logger.LogInformation("Retrieving all properties");

                var properties = await _propertyRepository.GetAllPropertiesAsync();
                var propertyDtos = properties.Select(MapToPropertyDto).ToList();

                _logger.LogInformation("Retrieved {PropertyCount} properties", propertyDtos.Count);

                return new PropertiesResponse
                {
                    Success = true,
                    Message = "Properties retrieved successfully",
                    Properties = propertyDtos,
                    TotalCount = propertyDtos.Count
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all properties");
                return new PropertiesResponse
                {
                    Success = false,
                    Message = $"Failed to retrieve properties: {ex.Message}",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        /// <summary>
        /// Retrieves all properties associated with a specific owner
        /// </summary>
        /// <param name="ownerId">The unique identifier of the property owner</param>
        /// <returns>A response containing the owner's properties or an error message</returns>
        public async Task<PropertiesResponse> GetPropertiesByOwnerIdAsync(int ownerId)
        {
            try
            {
                _logger.LogInformation("Retrieving properties for owner ID: {OwnerId}", ownerId);

                var properties = await _propertyRepository.GetPropertiesByOwnerIdAsync(ownerId);
                var propertyDtos = properties.Select(MapToPropertyDto).ToList();

                return new PropertiesResponse
                {
                    Success = true,
                    Message = $"Properties for owner {ownerId} retrieved successfully",
                    Properties = propertyDtos,
                    TotalCount = propertyDtos.Count
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving properties for owner ID: {OwnerId}", ownerId);
                return new PropertiesResponse
                {
                    Success = false,
                    Message = $"Failed to retrieve properties for owner: {ex.Message}",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        /// <summary>
        /// Retrieves all properties managed by a specific agent
        /// </summary>
        /// <param name="agentId">The unique identifier of the property agent</param>
        /// <returns>A response containing the agent's properties or an error message</returns>
        public async Task<PropertiesResponse> GetPropertiesByAgentIdAsync(int agentId)
        {
            try
            {
                _logger.LogInformation("Retrieving properties for agent ID: {AgentId}", agentId);

                var properties = await _propertyRepository.GetPropertiesByAgentIdAsync(agentId);
                var propertyDtos = properties.Select(MapToPropertyDto).ToList();

                return new PropertiesResponse
                {
                    Success = true,
                    Message = $"Properties for agent {agentId} retrieved successfully",
                    Properties = propertyDtos,
                    TotalCount = propertyDtos.Count
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving properties for agent ID: {AgentId}", agentId);
                return new PropertiesResponse
                {
                    Success = false,
                    Message = $"Failed to retrieve properties for agent: {ex.Message}",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        /// <summary>
        /// Retrieves all properties with a specific status
        /// </summary>
        /// <param name="status">The status to filter properties by (e.g., "Available", "Sold", "Rented")</param>
        /// <returns>A response containing properties with the specified status or an error message</returns>
        public async Task<PropertiesResponse> GetPropertiesByStatusAsync(string status)
        {
            try
            {
                _logger.LogInformation("Retrieving properties with status: {Status}", status);

                var properties = await _propertyRepository.GetPropertiesByStatusAsync(status);
                var propertyDtos = properties.Select(MapToPropertyDto).ToList();

                return new PropertiesResponse
                {
                    Success = true,
                    Message = $"Properties with status '{status}' retrieved successfully",
                    Properties = propertyDtos,
                    TotalCount = propertyDtos.Count
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving properties with status: {Status}", status);
                return new PropertiesResponse
                {
                    Success = false,
                    Message = $"Failed to retrieve properties by status: {ex.Message}",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        /// <summary>
        /// Searches properties based on the provided search term
        /// </summary>
        /// <param name="searchTerm">The term to search for in property titles, descriptions, addresses, etc.</param>
        /// <returns>A response containing matching properties or an error message</returns>
        public async Task<PropertiesResponse> SearchPropertiesAsync(string searchTerm)
        {
            try
            {
                _logger.LogInformation("Searching properties with term: {SearchTerm}", searchTerm);

                var properties = await _propertyRepository.SearchPropertiesAsync(searchTerm);
                var propertyDtos = properties.Select(MapToPropertyDto).ToList();

                return new PropertiesResponse
                {
                    Success = true,
                    Message = $"Search results for '{searchTerm}'",
                    Properties = propertyDtos,
                    TotalCount = propertyDtos.Count
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching properties with term: {SearchTerm}", searchTerm);
                return new PropertiesResponse
                {
                    Success = false,
                    Message = $"Failed to search properties: {ex.Message}",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        /// <summary>
        /// Updates an existing property with new information
        /// </summary>
        /// <param name="id">The unique identifier of the property to update</param>
        /// <param name="request">The update request containing new property data, images, and videos</param>
        /// <returns>A response indicating success or failure with the updated property details</returns>
        public async Task<PropertyResponse> UpdatePropertyAsync(int id, UpdatePropertyRequest request)
        {
            try
            {
                _logger.LogInformation("Updating property with ID: {PropertyId}", id);
                _logger.LogInformation("Update - Image URLs count: {ImageCount}, Video URLs count: {VideoCount}",
                    request.ImageUrls?.Count ?? 0, request.VideoUrls?.Count ?? 0);

                // Check if property exists
                var existingProperty = await _propertyRepository.GetPropertyByIdAsync(id);
                if (existingProperty == null)
                {
                    return new PropertyResponse
                    {
                        Success = false,
                        Message = "Property not found",
                        Errors = new List<string> { $"Property with ID {id} not found" }
                    };
                }

                var property = MapToPropertyEntity(request.Property);
                property.Id = id;

                // Update basic property information
                var updatedProperty = await _propertyRepository.UpdatePropertyAsync(property);
                if (updatedProperty == null)
                {
                    return new PropertyResponse
                    {
                        Success = false,
                        Message = "Failed to update property",
                        Errors = new List<string> { "Property update failed" }
                    };
                }

                // Handle image updates
                if (request.ImageUrls != null && request.ImageUrls.Any())
                {
                    _logger.LogInformation("Updating {ImageCount} images for property", request.ImageUrls.Count);
                    var propertyImages = request.ImageUrls.Select(url => new PropertyImage
                    {
                        PropertyId = id,
                        ImageUrl = url,
                        CreatedAt = DateTime.UtcNow
                    }).ToList();

                    await _propertyRepository.UpdatePropertyImagesAsync(id, propertyImages);
                }

                // Handle video updates
                if (request.VideoUrls != null && request.VideoUrls.Any())
                {
                    _logger.LogInformation("Updating {VideoCount} videos for property", request.VideoUrls.Count);
                    var propertyVideos = new List<PropertyVideo>();

                    foreach (var videoUrl in request.VideoUrls)
                    {
                        var videoSize = await _videoStorage.GetVideoSizeAsync(videoUrl);
                        var videoDuration = await _videoStorage.GetVideoDurationAsync(videoUrl);

                        var video = new PropertyVideo
                        {
                            PropertyId = id,
                            VideoUrl = videoUrl,
                            VideoName = Path.GetFileName(videoUrl),
                            FileSize = videoSize,
                            Duration = videoDuration,
                            CreatedAt = DateTime.UtcNow
                        };
                        propertyVideos.Add(video);
                    }

                    await _propertyRepository.UpdatePropertyVideosAsync(id, propertyVideos);
                }

                // Get the complete updated property
                var completeProperty = await _propertyRepository.GetPropertyByIdAsync(id);
                var propertyDto = MapToPropertyDto(completeProperty!);

                _logger.LogInformation("Property update completed successfully");

                return new PropertyResponse
                {
                    Success = true,
                    Message = "Property updated successfully",
                    Property = propertyDto
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating property with ID: {PropertyId}", id);
                return new PropertyResponse
                {
                    Success = false,
                    Message = $"Failed to update property: {ex.Message}",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        /// <summary>
        /// Deletes a property from the system
        /// </summary>
        /// <param name="id">The unique identifier of the property to delete</param>
        /// <returns>A response indicating success or failure of the deletion</returns>
        public async Task<PropertyResponse> DeletePropertyAsync(int id)
        {
            try
            {
                _logger.LogInformation("Deleting property with ID: {PropertyId}", id);

                var result = await _propertyRepository.DeletePropertyAsync(id);
                if (!result)
                {
                    return new PropertyResponse
                    {
                        Success = false,
                        Message = "Property not found or could not be deleted",
                        Errors = new List<string> { $"Property with ID {id} not found" }
                    };
                }

                return new PropertyResponse
                {
                    Success = true,
                    Message = "Property deleted successfully"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting property with ID: {PropertyId}", id);
                return new PropertyResponse
                {
                    Success = false,
                    Message = $"Failed to delete property: {ex.Message}",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        /// <summary>
        /// Adds images to an existing property
        /// </summary>
        /// <param name="propertyId">The unique identifier of the property to add images to</param>
        /// <param name="imageUrls">List of image URLs to add to the property</param>
        /// <returns>A response indicating success or failure with the updated property details</returns>
        public async Task<PropertyResponse> AddPropertyImagesAsync(int propertyId, List<string> imageUrls)
        {
            try
            {
                _logger.LogInformation("Adding images to property ID: {PropertyId}", propertyId);

                var propertyImages = imageUrls.Select(url => new PropertyImage
                {
                    PropertyId = propertyId,
                    ImageUrl = url,
                    CreatedAt = DateTime.UtcNow
                }).ToList();

                await _propertyRepository.AddPropertyImagesAsync(propertyId, propertyImages);

                var updatedProperty = await _propertyRepository.GetPropertyByIdAsync(propertyId);
                var propertyDto = MapToPropertyDto(updatedProperty!);

                return new PropertyResponse
                {
                    Success = true,
                    Message = "Images added successfully",
                    Property = propertyDto
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding images to property ID: {PropertyId}", propertyId);
                return new PropertyResponse
                {
                    Success = false,
                    Message = $"Failed to add images: {ex.Message}",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        /// <summary>
        /// Adds videos to an existing property
        /// </summary>
        /// <param name="propertyId">The unique identifier of the property to add videos to</param>
        /// <param name="videoUrls">List of video URLs to add to the property</param>
        /// <returns>A response indicating success or failure with the updated property details</returns>
        public async Task<PropertyResponse> AddPropertyVideosAsync(int propertyId, List<string> videoUrls)
        {
            try
            {
                _logger.LogInformation("Adding videos to property ID: {PropertyId}", propertyId);

                var propertyVideos = new List<PropertyVideo>();

                foreach (var videoUrl in videoUrls)
                {
                    var videoSize = await _videoStorage.GetVideoSizeAsync(videoUrl);
                    var videoDuration = await _videoStorage.GetVideoDurationAsync(videoUrl);

                    var video = new PropertyVideo
                    {
                        PropertyId = propertyId,
                        VideoUrl = videoUrl,
                        VideoName = Path.GetFileName(videoUrl),
                        FileSize = videoSize,
                        Duration = videoDuration,
                        CreatedAt = DateTime.UtcNow
                    };
                    propertyVideos.Add(video);
                }

                await _propertyRepository.AddPropertyVideosAsync(propertyId, propertyVideos);

                var updatedProperty = await _propertyRepository.GetPropertyByIdAsync(propertyId);
                var propertyDto = MapToPropertyDto(updatedProperty!);

                return new PropertyResponse
                {
                    Success = true,
                    Message = "Videos added successfully",
                    Property = propertyDto
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding videos to property ID: {PropertyId}", propertyId);
                return new PropertyResponse
                {
                    Success = false,
                    Message = $"Failed to add videos: {ex.Message}",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        /// <summary>
        /// Maps a PropertyDto to a PropertyHouse entity
        /// </summary>
        /// <param name="dto">The data transfer object containing property information</param>
        /// <returns>A PropertyHouse entity populated with the DTO data</returns>
        private PropertyHouse MapToPropertyEntity(PropertyDto dto)
        {
            return new PropertyHouse
            {
                Id = dto.Id,
                PropertyNo = dto.PropertyNo,
                Title = dto.Title,
                Description = dto.Description,
                Type = dto.Type,
                Price = dto.Price,
                PropertyAge = dto.PropertyAge,
                PropertyFloor = dto.PropertyFloor,
                Bedrooms = dto.Bedrooms,
                Bathrooms = dto.Bathrooms,
                AreaSqm = dto.AreaSqm,
                Kitchen = dto.Kitchen,
                Garage = dto.Garage,
                Country = dto.Country,
                Address = dto.Address,
                City = dto.City,
                State = dto.State,
                ZipCode = dto.ZipCode,
                Barangay = dto.Barangay,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                Status = dto.Status,
                OwnerId = dto.OwnerId,
                AgentId = dto.AgentId,
                Amenities = dto.Amenities,
                ListedDate = dto.ListedDate,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
        }

        /// <summary>
        /// Maps a PropertyHouse entity to a PropertyDto
        /// </summary>
        /// <param name="property">The property entity to map</param>
        /// <returns>A PropertyDto populated with the entity data and related images/videos</returns>
        private PropertyDto MapToPropertyDto(PropertyHouse property)
        {
            return new PropertyDto
            {
                Id = property.Id,
                PropertyNo = property.PropertyNo,
                Title = property.Title,
                Description = property.Description,
                Type = property.Type ?? string.Empty,
                Price = property.Price,
                PropertyAge = property.PropertyAge,
                PropertyFloor = property.PropertyFloor,
                Bedrooms = property.Bedrooms,
                Bathrooms = property.Bathrooms,
                AreaSqm = property.AreaSqm,
                Kitchen = property.Kitchen,
                Garage = property.Garage,
                Country = property.Country,
                Address = property.Address,
                City = property.City,
                State = property.State,
                ZipCode = property.ZipCode,
                Barangay = property.Barangay,
                Latitude = property.Latitude,
                Longitude = property.Longitude,
                Status = property.Status,
                OwnerId = property.OwnerId,
                AgentId = property.AgentId,
                Amenities = property.Amenities,
                ListedDate = property.ListedDate,
                PropertyImages = property.PropertyImages?.Select(img => new PropertyImageDto
                {
                    Id = img.Id,
                    PropertyId = img.PropertyId,
                    ImageUrl = img.ImageUrl
                }).ToList() ?? new List<PropertyImageDto>(),
                PropertyVideos = property.PropertyVideos?.Select(vid => new PropertyVideoDto
                {
                    Id = vid.Id,
                    PropertyId = vid.PropertyId,
                    VideoUrl = vid.VideoUrl,
                    ThumbnailUrl = vid.ThumbnailUrl,
                    VideoName = vid.VideoName,
                    Duration = vid.Duration,
                    FileSize = vid.FileSize,
                    CreatedAt = vid.CreatedAt
                }).ToList() ?? new List<PropertyVideoDto>(),
                MainImage = property.PropertyImages?.FirstOrDefault()?.ImageUrl ?? string.Empty,
                MainVideo = property.PropertyVideos?.FirstOrDefault()?.VideoUrl ?? string.Empty
            };
        }
    }
}