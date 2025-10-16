using System.ComponentModel.DataAnnotations;

namespace snapwrite.DTOs
{
    public class SignupRequest
    {
        [Required]
        public string Name { get; set; }

        [Required]
        public string Email {  get; set; }

        [Required]
        public string Password { get; set; }
    }

    public class LoginRequest
    {
        [Required]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }
    }

    public class AuthResponse
    {
        public string Token {  get; set; }
        public UserInfo User {  get; set; }
    }
    public class UserInfo
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
    }
}
