using System.ComponentModel.DataAnnotations;

namespace TechFix.API.DTOs.Repairs;

public class RepairCreateRequest
{
    [Required]
    public Guid ClientId { get; set; }

    [Required]
    public string DeviceBrand { get; set; } = string.Empty;

    [Required]
    public string DeviceModel { get; set; } = string.Empty;

    public string? Imei { get; set; }

    [Required]
    public string IssueDescription { get; set; } = string.Empty;

    public decimal? EstimatedCost { get; set; }
    public string? EstimatedCompletion { get; set; }
    public string? Accessories { get; set; }

    /// Compressed base64 data-URL photos (evidence of device condition at intake)
    public List<string>? Photos { get; set; }
}

public class RepairUpdateRequest
{
    public string? DeviceBrand { get; set; }
    public string? DeviceModel { get; set; }
    public string? Imei { get; set; }
    public string? IssueDescription { get; set; }
    public decimal? EstimatedCost { get; set; }
    public decimal? FinalCost { get; set; }
    public string? TechnicianNotes { get; set; }
    public string? EstimatedCompletion { get; set; }
    public string? Accessories { get; set; }
    public string? RepairResult { get; set; }
}

public class StatusUpdateRequest
{
    [Required]
    public string Status { get; set; } = string.Empty;
}

public class RepairResponse
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public Guid ClientId { get; set; }
    public string? ClientName { get; set; }
    public string? ClientPhone { get; set; }
    public string DeviceBrand { get; set; } = string.Empty;
    public string DeviceModel { get; set; } = string.Empty;
    public string? Imei { get; set; }
    public string IssueDescription { get; set; } = string.Empty;
    public string Status { get; set; } = "recibido";
    public decimal? EstimatedCost { get; set; }
    public decimal? FinalCost { get; set; }
    public string? TechnicianNotes { get; set; }
    public string? Accessories { get; set; }
    public string? EstimatedCompletion { get; set; }
    public List<string>? Photos { get; set; }
    public string? RepairResult { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class DashboardStatsResponse
{
    public int TotalRepairs { get; set; }
    public int TotalClients { get; set; }
    public int PendingRepairs { get; set; }
    public int CompletedToday { get; set; }
    public Dictionary<string, int> StatusCounts { get; set; } = new();
    public List<RepairResponse> RecentRepairs { get; set; } = new();
    public decimal TotalRevenue { get; set; }
}

/// Respuesta pública para el cliente (sin datos sensibles ni token)
public class TrackingResponse
{
    public string OrderNumber { get; set; } = string.Empty;
    public string DeviceBrand { get; set; } = string.Empty;
    public string DeviceModel { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? EstimatedCompletion { get; set; }
    public string? RepairResult { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string ShopName { get; set; } = "Aguirre Fix Pro";
}
