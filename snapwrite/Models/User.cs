using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Reflection.Metadata;
namespace snapwrite.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;

        [Required]
        [EmailAddress(ErrorMessage = "invalid email")]
        public string Email { get; set; } = null!;

        [Required]
        public string Password { get; set; } = null!;

        [DefaultValue(false)]
        public bool EmailVerified { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt {  get; set; }

        public List<Document> Documents { get; set; } = [];

    }
}
