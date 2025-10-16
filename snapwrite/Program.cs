using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using snapwrite.Data;
using snapwrite.Models;
using System.Text;
using Microsoft.AspNetCore.Http.Features;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.MaxDepth = 64;
        // ⭐ ADD THIS - Increase JSON buffer size
        options.JsonSerializerOptions.DefaultBufferSize = 104857600;
    });

// Increase request body size limit for multipart forms
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 104857600; // 100 MB
    options.ValueLengthLimit = int.MaxValue;
    options.MultipartHeadersLengthLimit = int.MaxValue;
});

// Configure Kestrel to accept larger requests
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 104857600; // 100 MB
    options.Limits.RequestHeadersTimeout = TimeSpan.FromMinutes(2);
    // ⭐ ADD THESE
    options.Limits.MaxRequestLineSize = 16384;
    options.Limits.MaxRequestHeadersTotalSize = 65536;
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


//it is for mysql
//builder.Services.AddDbContext<AppDbContext>(options =>
//    options.UseMySql(
//        builder.Configuration.GetConnectionString("DefaultConnection"),
//        ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("DefaultConnection"))
//    ));

//for sqlite

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(
        builder.Configuration.GetConnectionString("DefaultConnection")
    ));

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"];
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

// CORS for frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000") 
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.Use(async (context, next) =>
{
    try
    {
        await next();
    }
    catch (Exception ex)
    {
        // Log to file so we can see it even if debugger crashes
        var logPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "crash-log.txt");
        File.AppendAllText(logPath,
            $"[{DateTime.Now}] CRASH: {ex.GetType().Name}\n" +
            $"Message: {ex.Message}\n" +
            $"Stack: {ex.StackTrace}\n" +
            $"Inner: {ex.InnerException?.Message}\n\n");
        throw;
    }
});
app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Create database and seed test user
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    context.Database.EnsureCreated();

    // Seed test user if not exists
    if (!context.Users.Any())
    {
        context.Users.Add(new User
        {
            Name = "Test User",
            Email = "test@snapwrite.com",
            Password = BCrypt.Net.BCrypt.HashPassword("password123"),
            EmailVerified = true
        });
        context.SaveChanges();
    }
}

app.Run();