namespace Realstate_servcices.Server.Dto.Wishlist
{
    public class CreateWishlistDto
    {
        public int ClientId { get; set; }
        public int PropertyId { get; set; }
        public string? Notes { get; set; }
    }
}
