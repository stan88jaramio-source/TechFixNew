using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using TechFix.API.Data;
using TechFix.API.DTOs.Settings;
using TechFix.API.Models;

namespace TechFix.API.Services;

public class ShopSettingsService(AppDbContext db) : IShopSettingsService
{
    public async Task<ShopSettingsResponse> GetAsync()
    {
        var row = await db.ShopSettings.FirstOrDefaultAsync()
                  ?? new ShopSettings();
        return Map(row);
    }

    public async Task<ShopSettingsResponse> UpdateAsync(string shopName, IFormFile? logo, bool removeLogo)
    {
        var row = await db.ShopSettings.FirstOrDefaultAsync();

        if (row is null)
        {
            row = new ShopSettings();
            db.ShopSettings.Add(row);
        }

        row.ShopName = shopName;

        if (removeLogo)
        {
            row.LogoBase64 = null;
            row.LogoMimeType = null;
        }
        else if (logo is not null)
        {
            // Convertir el archivo a base64 puro (sin prefijo data:)
            using var ms = new MemoryStream();
            await logo.CopyToAsync(ms);
            row.LogoBase64 = Convert.ToBase64String(ms.ToArray());
            row.LogoMimeType = logo.ContentType;
        }
        // si logo == null y removeLogo == false → no se toca el logo actual

        row.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return Map(row);
    }

    private static ShopSettingsResponse Map(ShopSettings s) => new()
    {
        ShopName = s.ShopName,
        LogoBase64 = s.LogoBase64,
        LogoMimeType = s.LogoMimeType,
        UpdatedAt = s.UpdatedAt
    };
}
