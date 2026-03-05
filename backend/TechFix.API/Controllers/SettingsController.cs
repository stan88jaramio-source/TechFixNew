using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechFix.API.Services;

namespace TechFix.API.Controllers;

[ApiController]
[Route("api/settings")]
public class SettingsController(IShopSettingsService settings) : ControllerBase
{
    /// <summary>Obtiene la configuración pública de la tienda (logo, nombre).</summary>
    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var result = await settings.GetAsync();
        return Ok(result);
    }

    /// <summary>Actualiza nombre de tienda y/o logo. Solo admins.</summary>
    [Authorize(Roles = "admin")]
    [HttpPut]
    [DisableRequestSizeLimit]
    [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
    public async Task<IActionResult> Update(
        [FromForm] string shopName,
        IFormFile? logo,
        [FromForm] bool removeLogo = false)
    {
        if (string.IsNullOrWhiteSpace(shopName))
            return BadRequest(new { detail = "El nombre de la tienda es obligatorio." });

        if (logo is { Length: > 3_145_728 })
            return BadRequest(new { detail = "El logo no puede superar 3 MB." });

        var result = await settings.UpdateAsync(shopName.Trim(), logo, removeLogo);
        return Ok(result);
    }
}
