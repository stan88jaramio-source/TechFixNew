namespace TechFix.API.DTOs.Settings;

public class ShopSettingsResponse
{
    public string ShopName { get; set; } = string.Empty;
    public string? LogoBase64 { get; set; }
    public string? LogoMimeType { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class ShopSettingsRequest
{
    public string ShopName { get; set; } = string.Empty;
    /// <summary>
    /// Data URI completo: "data:image/png;base64,ABC123..."
    /// Si se envía null el logo no cambia; si se envía "" se borra el logo.
    /// </summary>
    public string? LogoBase64 { get; set; }
    public string? LogoMimeType { get; set; }
}
