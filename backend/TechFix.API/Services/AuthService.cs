using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TechFix.API.Data;
using TechFix.API.DTOs.Auth;
using TechFix.API.Models;

namespace TechFix.API.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public AuthService(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public async Task<TokenResponse> RegisterAsync(RegisterRequest request)
    {
        if (await _db.Users.AnyAsync(u => u.Email == request.Email))
            throw new InvalidOperationException("El email ya está registrado");

        var user = new User
        {
            Name = request.Name,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = "technician"
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return BuildToken(user);
    }

    public async Task<TokenResponse> LoginAsync(LoginRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email)
            ?? throw new UnauthorizedAccessException("Credenciales incorrectas");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Credenciales incorrectas");

        return BuildToken(user);
    }

    public async Task<UserDto> GetMeAsync(Guid userId)
    {
        var user = await _db.Users.FindAsync(userId)
            ?? throw new KeyNotFoundException("Usuario no encontrado");
        return ToDto(user);
    }

    public async Task SeedAdminAsync()
    {
        const string adminEmail = "admin@techfix.com";
        const string adminPassword = "admin123";

        var existing = await _db.Users.FirstOrDefaultAsync(u => u.Email == adminEmail);
        if (existing is null)
        {
            _db.Users.Add(new User
            {
                Name = "Admin TechFix",
                Email = adminEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword),
                Role = "admin"
            });
        }
        else
        {
            // Ensure the hash in DB always matches the seed password
            if (!BCrypt.Net.BCrypt.Verify(adminPassword, existing.PasswordHash))
            {
                existing.PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword);
            }
            // Ensure role is admin
            existing.Role = "admin";
        }

        await _db.SaveChangesAsync();
    }

    // ── Helpers ──────────────────────────────────────────────────

    private TokenResponse BuildToken(User user)
    {
        var key = _config["Jwt:Key"] ?? "techfix-pro-super-secret-key-2024-sqlserver";
        var issuer = _config["Jwt:Issuer"] ?? "TechFix.API";
        var audience = _config["Jwt:Audience"] ?? "TechFix.Client";
        var hours = int.TryParse(_config["Jwt:ExpireHours"], out var h) ? h : 24;

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(issuer, audience, claims,
            expires: DateTime.UtcNow.AddHours(hours),
            signingCredentials: credentials);

        return new TokenResponse
        {
            AccessToken = new JwtSecurityTokenHandler().WriteToken(token),
            User = ToDto(user)
        };
    }

    private static UserDto ToDto(User u) => new()
    {
        Id = u.Id,
        Name = u.Name,
        Email = u.Email,
        Role = u.Role,
        CreatedAt = u.CreatedAt
    };
}
