using System.ComponentModel.DataAnnotations;
namespace snapwrite.DTOs
{
    public class DocumentRequest
    {
        [Required]
        public string Title { get; set; }

        public string Content { get; set; }

    }

    public class DocumentResponse
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
    public class DocumentSummary  // For document list (without full content)
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Preview { get; set; }  
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

}
