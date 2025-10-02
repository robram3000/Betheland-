using Realstate_servcices.Server.Dto.Property;
using Realstate_servcices.Server.Entity.Properties;
using Realstate_servcices.Server.Repository.Properties;
using Realstate_servcices.Server.Utilities.Storage;

namespace Realstate_servcices.Server.Services.PropertyCreation
{
    public class CreatePropertyService : ICreatePropertyService
    {
        private readonly ICreatePropertyRepository _propertyRepository;
        private readonly ILocalstorageImage _imageStorage;

        public CreatePropertyService(ICreatePropertyRepository propertyRepository,
            ILocalstorageImage imageStorage
            )
        {
            _propertyRepository = propertyRepository;
            _imageStorage = imageStorage;
        }

        public async Task<PropertyResponse> CreatePropertyAsync(CreatePropertyRequest request)
        {
            try
            {
                var property = MapToEntity(request.Property);

                // Handle direct image URLs if provided
                if (request.ImageUrls != null && request.ImageUrls.Any())
                {
                    property.PropertyImages = request.ImageUrls.Select(url => new PropertyImage
                    {
                        ImageUrl = url,
                        CreatedAt = DateTime.UtcNow
                    }).ToList();
                }

                var createdProperty = await _propertyRepository.CreatePropertyAsync(property);
                var propertyDto = MapToDto(createdProperty);

                return new PropertyResponse
                {
                    Success = true,
                    Message = "Property created successfully",
                    Property = propertyDto
                };
            }
            catch (Exception ex)
            {
                return new PropertyResponse
                {
                    Success = false,
                    Message = $"Failed to create property: {ex.Message}",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<PropertyResponse> GetPropertyByIdAsync(int id)
        {
            try
            {
                var property = await _propertyRepository.GetPropertyByIdAsync(id);

                if (property == null)
                {
                    return new PropertyResponse
                    {
                        Success = false,
                        Message = "Property not found",
                        Errors = new List<string> { "Property not found" }
                    };
                }

                var propertyDto = MapToDto(property);
                return new PropertyResponse
                {
                    Success = true,
                    Message = "Property retrieved successfully",
                    Property = propertyDto
                };
            }
            catch (Exception ex)
            {
                return new PropertyResponse
                {
                    Success = false,
                    Message = $"Failed to retrieve property: {ex.Message}",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<PropertyResponse> UpdatePropertyAsync(int id, UpdatePropertyRequest request)
        {
            try
            {
                if (id != request.Property.Id)
                {
                    return new PropertyResponse
                    {
                        Success = false,
                        Message = "Property ID mismatch",
                        Errors = new List<string> { "Property ID in route does not match property ID in request" }
                    };
                }

                var existingProperty = await _propertyRepository.GetPropertyByIdAsync(id);
                if (existingProperty == null)
                {
                    return new PropertyResponse
                    {
                        Success = false,
                        Message = "Property not found",
                        Errors = new List<string> { "Property not found" }
                    };
                }

                var property = MapToEntity(request.Property);

                // Handle property images update
                if (request.ImageUrls != null && request.ImageUrls.Any())
                {
                    property.PropertyImages = request.ImageUrls.Select(url => new PropertyImage
                    {
                        ImageUrl = url,
                        CreatedAt = DateTime.UtcNow
                    }).ToList();
                }

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

                var propertyDto = MapToDto(updatedProperty);
                return new PropertyResponse
                {
                    Success = true,
                    Message = "Property updated successfully",
                    Property = propertyDto
                };
            }
            catch (Exception ex)
            {
                return new PropertyResponse
                {
                    Success = false,
                    Message = $"Failed to update property: {ex.Message}",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<PropertyResponse> DeletePropertyAsync(int id)
        {
            try
            {
                var property = await _propertyRepository.GetPropertyByIdAsync(id);
                if (property == null)
                {
                    return new PropertyResponse
                    {
                        Success = false,
                        Message = "Property not found",
                        Errors = new List<string> { "Property not found" }
                    };
                }

                // Delete associated images
                if (property.PropertyImages != null)
                {
                    foreach (var image in property.PropertyImages)
                    {
                        await _imageStorage.DeleteImageAsync(image.ImageUrl);
                    }
                }

                var result = await _propertyRepository.DeletePropertyAsync(id);

                if (!result)
                {
                    return new PropertyResponse
                    {
                        Success = false,
                        Message = "Failed to delete property",
                        Errors = new List<string> { "Property deletion failed" }
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
                return new PropertyResponse
                {
                    Success = false,
                    Message = $"Failed to delete property: {ex.Message}",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<PropertiesResponse> GetAllPropertiesAsync()
        {
            try
            {
                var properties = await _propertyRepository.GetAllPropertiesAsync();
                var propertyDtos = properties.Select(MapToDto).ToList();

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
                return new PropertiesResponse
                {
                    Success = false,
                    Message = $"Failed to retrieve properties: {ex.Message}",
                    Properties = new List<PropertyDto>()
                };
            }
        }

        public async Task<PropertiesResponse> GetPropertiesByOwnerIdAsync(int ownerId)
        {
            try
            {
                var properties = await _propertyRepository.GetPropertiesByOwnerIdAsync(ownerId);
                var propertyDtos = properties.Select(MapToDto).ToList();

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
                return new PropertiesResponse
                {
                    Success = false,
                    Message = $"Failed to retrieve properties: {ex.Message}",
                    Properties = new List<PropertyDto>()
                };
            }
        }

        public async Task<PropertiesResponse> GetPropertiesByAgentIdAsync(int agentId)
        {
            try
            {
                var properties = await _propertyRepository.GetPropertiesByAgentIdAsync(agentId);
                var propertyDtos = properties.Select(MapToDto).ToList();

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
                return new PropertiesResponse
                {
                    Success = false,
                    Message = $"Failed to retrieve properties: {ex.Message}",
                    Properties = new List<PropertyDto>()
                };
            }
        }

        public async Task<PropertiesResponse> GetPropertiesByStatusAsync(string status)
        {
            try
            {
                var properties = await _propertyRepository.GetPropertiesByStatusAsync(status);
                var propertyDtos = properties.Select(MapToDto).ToList();

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
                return new PropertiesResponse
                {
                    Success = false,
                    Message = $"Failed to retrieve properties: {ex.Message}",
                    Properties = new List<PropertyDto>()
                };
            }
        }

        public async Task<PropertiesResponse> SearchPropertiesAsync(string searchTerm)
        {
            try
            {
                var properties = await _propertyRepository.SearchPropertiesAsync(searchTerm);
                var propertyDtos = properties.Select(MapToDto).ToList();

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
                return new PropertiesResponse
                {
                    Success = false,
                    Message = $"Failed to retrieve properties: {ex.Message}",
                    Properties = new List<PropertyDto>()
                };
            }
        }

        private PropertyHouse MapToEntity(PropertyDto dto)
        {
            return new PropertyHouse
            {
                Id = dto.Id,
                Title = dto.Title,
                Description = dto.Description,
                Type = dto.Type,
                Price = dto.Price,
                PropertyAge = dto.PropertyAge,
                PropertyFloor = dto.PropertyFloor,
                Bedrooms = dto.Bedrooms,
                Bathrooms = dto.Bathrooms,
                AreaSqft = dto.AreaSqft,
                Address = dto.Address,
                City = dto.City,
                State = dto.State,
                ZipCode = dto.ZipCode,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                Status = dto.Status,
                OwnerId = dto.OwnerId,
                AgentId = dto.AgentId,
                Amenities = dto.Amenities,
                ListedDate = DateTime.UtcNow,
                PropertyImages = dto.PropertyImages?.Select(img => new PropertyImage
                {
                    Id = img.Id,
                    PropertyId = img.PropertyId,
                    ImageUrl = img.ImageUrl,
                    CreatedAt = DateTime.UtcNow
                }).ToList()
            };
        }

        private PropertyDto MapToDto(PropertyHouse entity)
        {
            return new PropertyDto
            {
                Id = entity.Id,
                Title = entity.Title,
                Description = entity.Description,
                Type = entity.Type,
                Price = entity.Price,
                PropertyAge = entity.PropertyAge,
                PropertyFloor = entity.PropertyFloor,
                Bedrooms = entity.Bedrooms,
                Bathrooms = entity.Bathrooms,
                AreaSqft = entity.AreaSqft,
                Address = entity.Address,
                City = entity.City,
                State = entity.State,
                ZipCode = entity.ZipCode,
                Latitude = entity.Latitude,
                Longitude = entity.Longitude,
                Status = entity.Status,
                OwnerId = entity.OwnerId,
                AgentId = entity.AgentId,
                Amenities = entity.Amenities,
                PropertyImages = entity.PropertyImages?.Select(img => new PropertyImageDto
                {
                    Id = img.Id,
                    PropertyId = img.PropertyId,
                    ImageUrl = img.ImageUrl
                }).ToList(),
                MainImage = entity.PropertyImages?.FirstOrDefault()?.ImageUrl
            };
        }
    }
}