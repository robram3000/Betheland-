using Realstate_servcices.Server.Dto.ConfigLandingpage;
using Realstate_servcices.Server.Repository.ContentLandingPage;

namespace Realstate_servcices.Server.Services.ConfigLandingpage
{
    public interface IPartnershipContentService
    {
        Task<PartnershipContentDto> GetPartnershipContentAsync();
        Task<ApiResponse<List<PartnerResponseDto>>> GetAllPartnersAsync();
        Task<ApiResponse<PartnerResponseDto>> GetPartnerByIdAsync(int id);
        Task<ApiResponse<PartnerResponseDto>> CreatePartnerAsync(CreatePartnerDto createDto);
        Task<ApiResponse<PartnerResponseDto>> UpdatePartnerAsync(int id, UpdatePartnerDto updateDto);
        Task<ApiResponse<bool>> DeletePartnerAsync(int id);
        Task<ApiResponse<bool>> TogglePartnerStatusAsync(int id, bool isActive);
        Task<ApiResponse<List<PartnerResponseDto>>> GetActivePartnersAsync();
    }

    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public List<string> Errors { get; set; } = new();

        public static ApiResponse<T> Ok(T data, string message = "Success")
        {
            return new ApiResponse<T> { Success = true, Data = data, Message = message };
        }

        public static ApiResponse<T> Fail(string message, List<string>? errors = null)
        {
            return new ApiResponse<T> { Success = false, Message = message, Errors = errors ?? new List<string>() };
        }
    }

    public class PartnershipContentService : IPartnershipContentService
    {
        private readonly IPartnershipContentRepository _repository;

        public PartnershipContentService(IPartnershipContentRepository repository)
        {
            _repository = repository;
        }

        public async Task<PartnershipContentDto> GetPartnershipContentAsync()
        {
            return await _repository.GetPartnershipContentAsync();
        }

        public async Task<ApiResponse<List<PartnerResponseDto>>> GetAllPartnersAsync()
        {
            try
            {
                var partners = await _repository.GetAllPartnersAsync();
                return ApiResponse<List<PartnerResponseDto>>.Ok(partners, "Partners retrieved successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<List<PartnerResponseDto>>.Fail("Error retrieving partners", new List<string> { ex.Message });
            }
        }

        public async Task<ApiResponse<PartnerResponseDto>> GetPartnerByIdAsync(int id)
        {
            try
            {
                var partner = await _repository.GetPartnerByIdAsync(id);
                if (partner == null)
                    return ApiResponse<PartnerResponseDto>.Fail("Partner not found");

                return ApiResponse<PartnerResponseDto>.Ok(partner, "Partner retrieved successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<PartnerResponseDto>.Fail("Error retrieving partner", new List<string> { ex.Message });
            }
        }

        public async Task<ApiResponse<PartnerResponseDto>> CreatePartnerAsync(CreatePartnerDto createDto)
        {
            try
            {
                // Check if partner name already exists
                if (await _repository.PartnerNameExistsAsync(createDto.Name))
                    return ApiResponse<PartnerResponseDto>.Fail("Partner name already exists");

                var partner = await _repository.CreatePartnerAsync(createDto);
                return ApiResponse<PartnerResponseDto>.Ok(partner, "Partner created successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<PartnerResponseDto>.Fail("Error creating partner", new List<string> { ex.Message });
            }
        }

        public async Task<ApiResponse<PartnerResponseDto>> UpdatePartnerAsync(int id, UpdatePartnerDto updateDto)
        {
            try
            {
                // Check if partner exists
                if (!await _repository.PartnerExistsAsync(id))
                    return ApiResponse<PartnerResponseDto>.Fail("Partner not found");

                // Check if partner name already exists (excluding current partner)
                if (!string.IsNullOrEmpty(updateDto.Name) &&
                    await _repository.PartnerNameExistsAsync(updateDto.Name, id))
                    return ApiResponse<PartnerResponseDto>.Fail("Partner name already exists");

                var partner = await _repository.UpdatePartnerAsync(id, updateDto);
                if (partner == null)
                    return ApiResponse<PartnerResponseDto>.Fail("Partner not found");

                return ApiResponse<PartnerResponseDto>.Ok(partner, "Partner updated successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<PartnerResponseDto>.Fail("Error updating partner", new List<string> { ex.Message });
            }
        }

        public async Task<ApiResponse<bool>> DeletePartnerAsync(int id)
        {
            try
            {
                var result = await _repository.DeletePartnerAsync(id);
                if (!result)
                    return ApiResponse<bool>.Fail("Partner not found");

                return ApiResponse<bool>.Ok(true, "Partner deleted successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<bool>.Fail("Error deleting partner", new List<string> { ex.Message });
            }
        }

        public async Task<ApiResponse<bool>> TogglePartnerStatusAsync(int id, bool isActive)
        {
            try
            {
                var result = await _repository.TogglePartnerStatusAsync(id, isActive);
                if (!result)
                    return ApiResponse<bool>.Fail("Partner not found");

                var status = isActive ? "activated" : "deactivated";
                return ApiResponse<bool>.Ok(true, $"Partner {status} successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<bool>.Fail("Error updating partner status", new List<string> { ex.Message });
            }
        }

        public async Task<ApiResponse<List<PartnerResponseDto>>> GetActivePartnersAsync()
        {
            try
            {
                var partners = await _repository.GetActivePartnersAsync();
                return ApiResponse<List<PartnerResponseDto>>.Ok(partners, "Active partners retrieved successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<List<PartnerResponseDto>>.Fail("Error retrieving active partners", new List<string> { ex.Message });
            }
        }
    }
}
