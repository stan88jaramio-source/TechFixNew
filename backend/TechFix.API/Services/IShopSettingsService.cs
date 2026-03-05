using Microsoft.AspNetCore.Http;
using TechFix.API.DTOs.Settings;

namespace TechFix.API.Services;

public interface IShopSettingsService
{
    Task<ShopSettingsResponse> GetAsync();
    Task<ShopSettingsResponse> UpdateAsync(string shopName, IFormFile? logo, bool removeLogo);
}
