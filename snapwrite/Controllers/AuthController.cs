using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using snapwrite.Data;
using snapwrite.DTOs;
using snapwrite.Models;

namespace snapwrite.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        public readonly IConfiguration _config;

        public AuthController(AppDbContext db, IConfiguration config)
        {
            _db = db;
            _config = config;
        }

        private string GenerateJwtToken(User user)
        {
            var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"]);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Name),
                    new Claim(ClaimTypes.Email, user.Email)
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };
            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        [HttpPost("signup")]
        public async Task<IActionResult> Signup(SignupRequest request)
        {
            string email = request.Email;
            if (await _db.Users.AnyAsync(u => u.Email == email))
            {
                return BadRequest(new { message = "Email already Exists" });
            }
            var user = new User
            {
                Name = request.Name,
                Email = request.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(request.Password)
            };
            await _db.Users.AddAsync(user);
            await _db.SaveChangesAsync();
            var token = GenerateJwtToken(user);
            return Ok(new AuthResponse
            {
                Token = token,
                User = new UserInfo { Id = user.Id, Name = user.Name, Email = user.Email }
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            string email = request.Email;
            string password = request.Password;
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);

            // First check if user exists
            if (user == null)
            {
                return BadRequest(new { message = "Invalid Credentials" });
            }

            // Then verify password
            if (!BCrypt.Net.BCrypt.Verify(password, user.Password))
            {
                return BadRequest(new { message = "Invalid Credentials" });
            }

            // Only generate token if both checks pass
            var token = GenerateJwtToken(user);
            return Ok(new AuthResponse
            {
                Token = token,
                User = new UserInfo { Id = user.Id, Name = user.Name, Email = user.Email }
            });
        }

        [Authorize]
        [HttpGet("user")]
        public async Task<IActionResult> GetUser()
        {
            // Get the user ID from JWT claims
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized(new { message = "User not found in token" });
            }

            if (!int.TryParse(userIdClaim, out int userId))
            {
                return BadRequest(new { message = "Invalid user ID format" });
            }

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            return Ok(new UserInfo
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email
            });
        }

        //[Authorize]
        //[HttpPost("logout")]
        //public IActionResult Logout()
        //{
        //    // JWT tokens are stateless, so logout on the client-side is sufficient
        //    // You can return a success message
        //    return Ok(new { message = "Logout successful" });
        //}
    }
}