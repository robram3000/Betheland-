namespace Realstate_servcices.Server.Dto.Wishlist
{
    public class WishlistDetailDto
    {
        public int Id { get; set; }
        public Guid WishlistNo { get; set; }
        public int ClientId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public int PropertyId { get; set; }
        public string PropertyTitle { get; set; } = string.Empty;
        public decimal PropertyPrice { get; set; }
        public string PropertyAddress { get; set; } = string.Empty;
        public string PropertyStatus { get; set; } = string.Empty;
        public DateTime AddedDate { get; set; }
        public string? Notes { get; set; }
        public List<string> PropertyImages { get; set; } = new();
    }
}
