namespace Realstate_servcices.Server.Dto.Wishlist
{
    public class WishlistDto
    {
        public int Id { get; set; }
        public Guid WishlistNo { get; set; }
        public int ClientId { get; set; }
        public int PropertyId { get; set; }
        public DateTime AddedDate { get; set; }
        public string? Notes { get; set; }
    }
}
