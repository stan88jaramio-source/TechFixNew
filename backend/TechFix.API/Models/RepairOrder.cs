using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TechFix.API.Models;

public class RepairOrder
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(30)]
    public string OrderNumber { get; set; } = string.Empty;

    [Required]
    public Guid ClientId { get; set; }

    [ForeignKey(nameof(ClientId))]
    public Client? Client { get; set; }

    [Required, MaxLength(200)]
    public string DeviceBrand { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string DeviceModel { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? Imei { get; set; }

    [Required, MaxLength(1000)]
    public string IssueDescription { get; set; } = string.Empty;

    [Required, MaxLength(30)]
    public string Status { get; set; } = "recibido";

    [Column(TypeName = "decimal(10,2)")]
    public decimal? EstimatedCost { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal? FinalCost { get; set; }

    [MaxLength(2000)]
    public string? TechnicianNotes { get; set; }

    [MaxLength(500)]
    public string? Accessories { get; set; }

    [MaxLength(100)]
    public string? EstimatedCompletion { get; set; }

    /// JSON array of compressed base64 data-URL strings (evidence photos)
    public string? Photos { get; set; }

    /// "si" = repaired successfully, "no" = could not repair, null = not yet evaluated
    [MaxLength(10)]
    public string? RepairResult { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
