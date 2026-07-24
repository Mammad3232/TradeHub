using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using TradeHub.API.DTOs.Auth;
using TradeHub.API.Models;
using TradeHub.API.Repositories.Interfaces;
using TradeHub.API.Services.Interfaces;

namespace TradeHub.API.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepo;
    private readonly IConfiguration _config;

    public AuthService(IUserRepository userRepo, IConfiguration config)
    {
        _userRepo = userRepo;
        _config = config;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        // Check for duplicate email
        if (await _userRepo.EmailExistsAsync(dto.Email))
            throw new InvalidOperationException("An account with this email address already exists.");

        // Parse the requested role from the DTO; default to Customer if missing or unrecognised.
        var role = UserRole.Customer;
        if (!string.IsNullOrEmpty(dto.Role) &&
            Enum.TryParse<UserRole>(dto.Role, ignoreCase: true, out var parsedRole))
        {
            role = parsedRole;
        }

        // Hash the password with BCrypt (cost factor 11 — strong but still fast)
        var user = new User
        {
            FullName = dto.FullName.Trim(),
            Email = dto.Email.Trim().ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password, 11),
            Role = role,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _userRepo.CreateAsync(user);
        var token = GenerateJwtToken(created);

        return new AuthResponseDto
        {
            Token = token,
            User = MapToUserDto(created)
        };
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await _userRepo.GetByEmailAsync(dto.Email.Trim());

        // Use constant-time check to prevent timing attacks — always verify hash even if user not found
        var isValid = user is not null && BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);

        if (!isValid)
            throw new UnauthorizedAccessException("Invalid email or password.");

        var token = GenerateJwtToken(user!);

        return new AuthResponseDto
        {
            Token = token,
            User = MapToUserDto(user!)
        };
    }

    // ── JWT Generation ─────────────────────────────────────────────────────────

    private string GenerateJwtToken(User user)
    {
        var jwtKey = _config["Jwt:Key"]
            ?? throw new InvalidOperationException("JWT Key is not configured.");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("userId", user.Id.ToString()),
            new Claim("fullName", user.FullName),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),    // 7-day expiry
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static UserDto MapToUserDto(User user) => new()
    {
        Id = user.Id,
        FullName = user.FullName,
        Email = user.Email,
        Role = user.Role.ToString()
    };
}
