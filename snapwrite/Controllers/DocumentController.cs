using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Timeouts;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using snapwrite.Data;
using snapwrite.DTOs;
using snapwrite.Models;
using System.Security.Claims;

namespace snapwrite.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class DocumentController : ControllerBase
    {
        private readonly AppDbContext _db;

        public DocumentController(AppDbContext db)
        {
            _db = db;
        }

        private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        // Make this STATIC so it can be called outside of queries
        private static string GetPreview(string content, int maxLength = 50)
        {
            if (string.IsNullOrWhiteSpace(content))
                return string.Empty;

            // Remove extra whitespace and newlines
            var cleaned = content.Trim().Replace("\r\n", " ").Replace("\n", " ");

            // Replace multiple spaces with single space
            while (cleaned.Contains("  "))
                cleaned = cleaned.Replace("  ", " ");

            // If content is shorter than max length, return as is
            if (cleaned.Length <= maxLength)
                return cleaned;

            // Find the last space before maxLength to avoid cutting words
            var lastSpace = cleaned.LastIndexOf(' ', maxLength);
            if (lastSpace > 0)
                return cleaned.Substring(0, lastSpace) + "...";

            // If no space found, just cut at maxLength
            return cleaned.Substring(0, maxLength) + "...";
        }

        [HttpGet]
        public async Task<IActionResult> GetDocuments()
        {
            var UserId = GetUserId();

            // First, fetch the raw data from the database
            var documents = await _db.Documents
                .Where(d => d.UserId == UserId)
                .OrderByDescending(d => d.UpdatedAt)
                .Select(d => new
                {
                    d.Id,
                    d.Title,
                    d.Content,
                    d.CreatedAt,
                    d.UpdatedAt
                })
                .ToListAsync();

            // Then, process the preview in memory (client-side evaluation)
            var result = documents.Select(d => new DocumentSummary
            {
                Id = d.Id,
                Title = d.Title,
                Preview = GetPreview(d.Content, 50),
                CreatedAt = (DateTime)d.CreatedAt,
                UpdatedAt = (DateTime)d.UpdatedAt
            }).ToList();

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDocument(int id)
        {
            var userId = GetUserId();
            var document = await _db.Documents
                .Where(d => d.Id == id && d.UserId == userId)
                .Select(d => new DocumentResponse
                {
                    Id = d.Id,
                    Title = d.Title,
                    Content = d.Content,
                    CreatedAt = (DateTime)d.CreatedAt,
                    UpdatedAt = (DateTime)d.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (document == null)
                return NotFound(new { message = "Document not found" });

            return Ok(document);
        }

        [HttpPost]
        [RequestSizeLimit(104857600)] // 100 MB
       
        public async Task<IActionResult> CreateDocument(DocumentRequest request)
        {
            var userId = GetUserId();
            var document = new Document
            {
                Title = request.Title,
                Content = request.Content,
                UserId = userId
            };

            _db.Documents.Add(document);
            await _db.SaveChangesAsync();

            var response = new DocumentResponse
            {
                Id = document.Id,
                Title = document.Title,
                Content = document.Content,
                CreatedAt = (DateTime)document.CreatedAt,
                UpdatedAt = (DateTime)document.UpdatedAt
            };

            return CreatedAtAction(nameof(GetDocument), new { id = document.Id }, response);
        }


        [HttpPut("{id}")]
        [RequestSizeLimit(104857600)] // 100 MB
        
        public async Task<IActionResult> UpdateDocument(int id, DocumentRequest request)
        {
            var userId = GetUserId();
            var document = await _db.Documents
                .FirstOrDefaultAsync(d => d.Id == id && d.UserId == userId);

            if (document == null)
                return NotFound(new { message = "Document not found" });

            if (!string.IsNullOrEmpty(request.Content) &&
                request.Content.Length > 100_000_000) // 100MB
            {
                return BadRequest(new { message = "Document content is too large" });
            }
            document.Title = request.Title;
            document.Content = request.Content;
            document.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            var response = new DocumentResponse
            {
                Id = document.Id,
                Title = document.Title,
                Content = document.Content,
                CreatedAt = (DateTime)document.CreatedAt,
                UpdatedAt = (DateTime)document.UpdatedAt
            };

            return Ok(response);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDocument(int id)
        {
            var userId = GetUserId();
            var document = await _db.Documents
                .FirstOrDefaultAsync(d => d.Id == id && d.UserId == userId);

            if (document == null)
                return NotFound(new { message = "Document not found" });

            _db.Documents.Remove(document);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Document deleted successfully" });
        }
    }
}
