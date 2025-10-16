namespace snapwrite.Models
{
    public class Document
    {
        public int Id { get; set; }

        public string Title { get; set; } = null!;

        public string? Content { get; set; } = "";

        public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? UpdatedAt {  get; set; } = DateTime.UtcNow;

        public int UserId { get; set; }

        public User User { get; set; } = null!;

    }
}
