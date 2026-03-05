using TechFix.API.DTOs.Repairs;

namespace TechFix.API.Services;

public interface IRepairService
{
    Task<List<RepairResponse>> GetRepairsAsync(string? status, string? search, Guid? clientId);
    Task<RepairResponse> GetRepairAsync(Guid id);
    Task<RepairResponse> CreateRepairAsync(RepairCreateRequest request);
    Task<RepairResponse> UpdateRepairAsync(Guid id, RepairUpdateRequest request);
    Task<RepairResponse> UpdateStatusAsync(Guid id, string newStatus);
    Task DeleteRepairAsync(Guid id);
    Task<DashboardStatsResponse> GetDashboardStatsAsync();
    Task<TrackingResponse> GetRepairTrackingAsync(string orderNumber);
}
