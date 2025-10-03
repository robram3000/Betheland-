using Microsoft.EntityFrameworkCore;
using Realstate_servcices.Server.Data;
using Realstate_servcices.Server.Entity.Properties;

namespace Realstate_servcices.Server.Repository.Properties
{
    public class CreatePropertyRepository : ICreatePropertyRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CreatePropertyRepository> _logger;

        public CreatePropertyRepository(ApplicationDbContext context, ILogger<CreatePropertyRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<PropertyHouse> CreatePropertyAsync(PropertyHouse property)
        {
            try
            {
                _logger.LogInformation("Creating new property with title: {Title}", property.Title);

                if (property.PropertyNo == Guid.Empty)
                {
                    property.PropertyNo = Guid.NewGuid();
                }

                property.CreatedAt = DateTime.UtcNow;
                property.UpdatedAt = DateTime.UtcNow;

                if (property.ListedDate == DateTime.MinValue)
                {
                    property.ListedDate = DateTime.UtcNow;
                }

                // Ensure OwnerId is valid or null to avoid foreign key constraints
                if (property.OwnerId <= 0)
                {
                    property.OwnerId = null;
                }

                // Ensure AgentId is valid or null
                if (property.AgentId <= 0)
                {
                    property.AgentId = null;
                }

                _context.Properties.Add(property);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Property created successfully with ID: {PropertyId}", property.Id);
                return property;
            }
            catch (DbUpdateException dbEx)
            {
                _logger.LogError(dbEx, "Database error occurred while creating property");
                throw new Exception($"Database error while creating property: {dbEx.InnerException?.Message ?? dbEx.Message}", dbEx);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating property");
                throw new Exception($"Failed to create property: {ex.Message}", ex);
            }
        }

        public async Task<bool> OwnerExistsAsync(int ownerId)
        {
            try
            {
                return await _context.Clients
                    .AsNoTracking()
                    .AnyAsync(c => c.Id == ownerId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while checking if owner exists with ID: {OwnerId}", ownerId);
                throw new Exception($"Failed to check owner existence: {ex.Message}", ex);
            }
        }

        public async Task<PropertyHouse?> GetPropertyByIdAsync(int id)
        {
            try
            {
                _logger.LogInformation("Retrieving property with ID: {PropertyId}", id);

                var property = await _context.Properties
                    .Include(p => p.PropertyImages)
                    .Include(p => p.Owner)
                    .Include(p => p.Agent)
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (property == null)
                {
                    _logger.LogWarning("Property with ID {PropertyId} not found", id);
                }

                return property;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving property with ID: {PropertyId}", id);
                throw new Exception($"Failed to retrieve property: {ex.Message}", ex);
            }
        }

        public async Task<PropertyHouse?> UpdatePropertyAsync(PropertyHouse property)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                _logger.LogInformation("Updating property with ID: {PropertyId}", property.Id);

                var existingProperty = await _context.Properties
                    .Include(p => p.PropertyImages)
                    .FirstOrDefaultAsync(p => p.Id == property.Id);

                if (existingProperty == null)
                {
                    _logger.LogWarning("Property with ID {PropertyId} not found for update", property.Id);
                    return null;
                }

                // Update properties
                existingProperty.Title = property.Title;
                existingProperty.Description = property.Description;
                existingProperty.Type = property.Type;
                existingProperty.Price = property.Price;
                existingProperty.PropertyAge = property.PropertyAge;
                existingProperty.PropertyFloor = property.PropertyFloor;
                existingProperty.Bedrooms = property.Bedrooms;
                existingProperty.Bathrooms = property.Bathrooms;
                existingProperty.AreaSqft = property.AreaSqft;
                existingProperty.Address = property.Address;
                existingProperty.City = property.City;
                existingProperty.State = property.State;
                existingProperty.ZipCode = property.ZipCode;
                existingProperty.Latitude = property.Latitude;
                existingProperty.Longitude = property.Longitude;
                existingProperty.Status = property.Status;
                existingProperty.OwnerId = property.OwnerId;
                existingProperty.AgentId = property.AgentId;
                existingProperty.Amenities = property.Amenities;
                existingProperty.UpdatedAt = DateTime.UtcNow;

                // Handle images update if provided
                if (property.PropertyImages != null && property.PropertyImages.Any())
                {
                    _logger.LogInformation("Updating property images for property ID: {PropertyId}", property.Id);

                    // Remove existing images
                    var existingImages = _context.PropertyImages.Where(pi => pi.PropertyId == existingProperty.Id);
                    _context.PropertyImages.RemoveRange(existingImages);

                    // Add new images
                    foreach (var image in property.PropertyImages)
                    {
                        var newImage = new PropertyImage
                        {
                            PropertyId = existingProperty.Id,
                            ImageUrl = image.ImageUrl,
                            CreatedAt = DateTime.UtcNow
                        };
                        _context.PropertyImages.Add(newImage);
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Property with ID {PropertyId} updated successfully", property.Id);

                return await _context.Properties
                    .Include(p => p.PropertyImages)
                    .Include(p => p.Owner)
                    .Include(p => p.Agent)
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.Id == property.Id);
            }
            catch (DbUpdateException dbEx)
            {
                await transaction.RollbackAsync();
                _logger.LogError(dbEx, "Database error occurred while updating property with ID: {PropertyId}", property.Id);
                throw new Exception($"Database error while updating property: {dbEx.InnerException?.Message ?? dbEx.Message}", dbEx);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error occurred while updating property with ID: {PropertyId}", property.Id);
                throw new Exception($"Failed to update property: {ex.Message}", ex);
            }
        }

        public async Task<bool> DeletePropertyAsync(int id)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                _logger.LogInformation("Deleting property with ID: {PropertyId}", id);

                var property = await _context.Properties
                    .Include(p => p.PropertyImages)
                    .Include(p => p.ScheduleProperties)
                    .Include(p => p.Wishlists)
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (property == null)
                {
                    _logger.LogWarning("Property with ID {PropertyId} not found for deletion", id);
                    return false;
                }

                // Remove related entities first to avoid foreign key constraints
                if (property.PropertyImages != null && property.PropertyImages.Any())
                {
                    _context.PropertyImages.RemoveRange(property.PropertyImages);
                }

                if (property.ScheduleProperties != null && property.ScheduleProperties.Any())
                {
                    _context.ScheduleProperties.RemoveRange(property.ScheduleProperties);
                }

                if (property.Wishlists != null && property.Wishlists.Any())
                {
                    _context.Wishlists.RemoveRange(property.Wishlists);
                }

                // Remove the property
                _context.Properties.Remove(property);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Property with ID {PropertyId} deleted successfully", id);
                return true;
            }
            catch (DbUpdateException dbEx)
            {
                await transaction.RollbackAsync();
                _logger.LogError(dbEx, "Database error occurred while deleting property with ID: {PropertyId}", id);
                throw new Exception($"Database error while deleting property: {dbEx.InnerException?.Message ?? dbEx.Message}", dbEx);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error occurred while deleting property with ID: {PropertyId}", id);
                throw new Exception($"Failed to delete property: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<PropertyHouse>> GetAllPropertiesAsync()
        {
            try
            {
                _logger.LogInformation("Retrieving all properties");

                var properties = await _context.Properties
                    .Include(p => p.PropertyImages)
                    .Include(p => p.Owner)
                    .Include(p => p.Agent)
                    .AsNoTracking()
                    .OrderByDescending(p => p.CreatedAt)
                    .ToListAsync();

                _logger.LogInformation("Retrieved {Count} properties", properties.Count);
                return properties;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving all properties");
                throw new Exception($"Failed to retrieve properties: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<PropertyHouse>> GetPropertiesByOwnerIdAsync(int ownerId)
        {
            try
            {
                _logger.LogInformation("Retrieving properties for owner ID: {OwnerId}", ownerId);

                var properties = await _context.Properties
                    .Include(p => p.PropertyImages)
                    .Include(p => p.Owner)
                    .Include(p => p.Agent)
                    .Where(p => p.OwnerId == ownerId)
                    .AsNoTracking()
                    .OrderByDescending(p => p.CreatedAt)
                    .ToListAsync();

                _logger.LogInformation("Retrieved {Count} properties for owner ID: {OwnerId}", properties.Count, ownerId);
                return properties;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving properties for owner ID: {OwnerId}", ownerId);
                throw new Exception($"Failed to retrieve properties for owner: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<PropertyHouse>> GetPropertiesByAgentIdAsync(int agentId)
        {
            try
            {
                _logger.LogInformation("Retrieving properties for agent ID: {AgentId}", agentId);

                var properties = await _context.Properties
                    .Include(p => p.PropertyImages)
                    .Include(p => p.Owner)
                    .Include(p => p.Agent)
                    .Where(p => p.AgentId == agentId)
                    .AsNoTracking()
                    .OrderByDescending(p => p.CreatedAt)
                    .ToListAsync();

                _logger.LogInformation("Retrieved {Count} properties for agent ID: {AgentId}", properties.Count, agentId);
                return properties;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving properties for agent ID: {AgentId}", agentId);
                throw new Exception($"Failed to retrieve properties for agent: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<PropertyHouse>> GetPropertiesByStatusAsync(string status)
        {
            try
            {
                _logger.LogInformation("Retrieving properties with status: {Status}", status);

                var properties = await _context.Properties
                    .Include(p => p.PropertyImages)
                    .Include(p => p.Owner)
                    .Include(p => p.Agent)
                    .Where(p => p.Status.ToLower() == status.ToLower())
                    .AsNoTracking()
                    .OrderByDescending(p => p.CreatedAt)
                    .ToListAsync();

                _logger.LogInformation("Retrieved {Count} properties with status: {Status}", properties.Count, status);
                return properties;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving properties with status: {Status}", status);
                throw new Exception($"Failed to retrieve properties by status: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<PropertyHouse>> SearchPropertiesAsync(string searchTerm)
        {
            try
            {
                _logger.LogInformation("Searching properties with term: {SearchTerm}", searchTerm);

                if (string.IsNullOrWhiteSpace(searchTerm))
                {
                    return await GetAllPropertiesAsync();
                }

                var properties = await _context.Properties
                    .Include(p => p.PropertyImages)
                    .Include(p => p.Owner)
                    .Include(p => p.Agent)
                    .Where(p =>
                        p.Title.Contains(searchTerm) ||
                        p.Description.Contains(searchTerm) ||
                        p.Address.Contains(searchTerm) ||
                        p.City.Contains(searchTerm) ||
                        p.State.Contains(searchTerm) ||
                        p.ZipCode.Contains(searchTerm) ||
                        p.Type.Contains(searchTerm))
                    .AsNoTracking()
                    .OrderByDescending(p => p.CreatedAt)
                    .ToListAsync();

                _logger.LogInformation("Found {Count} properties matching search term: {SearchTerm}", properties.Count, searchTerm);
                return properties;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while searching properties with term: {SearchTerm}", searchTerm);
                throw new Exception($"Failed to search properties: {ex.Message}", ex);
            }
        }

        public async Task<bool> PropertyExistsAsync(int id)
        {
            try
            {
                return await _context.Properties
                    .AsNoTracking()
                    .AnyAsync(p => p.Id == id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while checking if property exists with ID: {PropertyId}", id);
                throw new Exception($"Failed to check property existence: {ex.Message}", ex);
            }
        }
    }
}