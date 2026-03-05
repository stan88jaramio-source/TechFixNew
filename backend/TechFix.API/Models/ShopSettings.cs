namespace TechFix.API.Models;

public class ShopSettings
{
    public int Id { get; set; }                         // siempre 1 (fila única)
    public string ShopName { get; set; } = "Aguirre Fix Pro";
    public string? LogoBase64 { get; set; }             // data URI completo, ej: "data:image/png;base64,..."
    public string? LogoMimeType { get; set; }           // "image/png", "image/jpeg", etc.
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
