// PartnerDto.cs
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace Realstate_servcices.Server.Dto.ConfigLandingpage
{
    public class PartnerDto
    {
        public string Name { get; set; } = string.Empty;
        public string Logo { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
    }

    public class PartnershipContentDto
    {
        public string Title { get; set; } = "Our Trusted Partners";
        public string Description { get; set; } = "Collaborating with the Philippines' leading real estate developers and brokers to bring you the best properties.";
        public List<PartnerDto> Partners { get; set; } = new();
    }

    public class CreatePartnerDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Url]
        [StringLength(500)]
        public string LogoUrl { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Category { get; set; } = string.Empty;

        public int DisplayOrder { get; set; } = 0;
    }

    public class UpdatePartnerDto
    {
        [StringLength(100)]
        public string? Name { get; set; }

        [Url]
        [StringLength(500)]
        public string? LogoUrl { get; set; }

        [StringLength(100)]
        public string? Category { get; set; }

        public int? DisplayOrder { get; set; }
        public bool? IsActive { get; set; }
    }

    public class PartnerResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string LogoUrl { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    // Add the missing DTOs here
    public class CreatePartnerWithLogoDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public IFormFile LogoFile { get; set; }

        [Required]
        [StringLength(100)]
        public string Category { get; set; } = string.Empty;

        public int DisplayOrder { get; set; } = 0;
    }

    public class UpdatePartnerWithLogoDto
    {
        [StringLength(100)]
        public string? Name { get; set; }

        public IFormFile? LogoFile { get; set; }

        [StringLength(100)]
        public string? Category { get; set; }

        public int? DisplayOrder { get; set; }
        public bool? IsActive { get; set; }
    }

    public class StatusUpdateDto
    {
        public bool IsActive { get; set; }
    }
}