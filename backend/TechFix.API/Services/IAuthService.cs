using TechFix.API.DTOs.Auth;

namespace TechFix.API.Services;

public interface IAuthService
{
    Task<TokenResponse> RegisterAsync(RegisterRequest request);
    Task<TokenResponse> LoginAsync(LoginRequest request);
    Task<UserDto> GetMeAsync(Guid userId);
    Task SeedAdminAsync();
}
