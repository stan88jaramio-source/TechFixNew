using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TechFix.API.Data;
using TechFix.API.DTOs.Repairs;
using TechFix.API.Models;

namespace TechFix.API.Services;

public class RepairService : IRepairService
{
    private static readonly string[] ValidStatuses =
        ["recibido", "diagnostico", "reparando", "listo", "entregado"];

    private readonly AppDbContext _db;

    public RepairService(AppDbContext db) => _db = db;

    public async Task<List<RepairResponse>> GetRepairsAsync(string? status, string? search, Guid? clientId)
    {
        var query = _db.Repairs.Include(r => r.Client).AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) && status != "todos")
            query = query.Where(r => r.Status == status);

        if (clientId.HasValue)
            query = query.Where(r => r.ClientId == clientId.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var lower = search.ToLower();
            query = query.Where(r =>
                r.OrderNumber.ToLower().Contains(lower) ||
                (r.Client != null && r.Client.Name.ToLower().Contains(lower)) ||
                r.DeviceBrand.ToLower().Contains(lower) ||
                r.DeviceModel.ToLower().Contains(lower));
        }

        return await query
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => ToResponse(r))
            .ToListAsync();
    }

    public async Task<RepairResponse> GetRepairAsync(Guid id)
    {
        var repair = await _db.Repairs.Include(r => r.Client)
                         .FirstOrDefaultAsync(r => r.Id == id)
                     ?? throw new KeyNotFoundException("Orden no encontrada");
        return ToResponse(repair);
    }

    public async Task<RepairResponse> CreateRepairAsync(RepairCreateRequest request)
    {
        var client = await _db.Clients.FindAsync(request.ClientId)
            ?? throw new KeyNotFoundException("Cliente no encontrado");

        var repair = new RepairOrder
        {
            OrderNumber = GenerateOrderNumber(),
            ClientId = request.ClientId,
            DeviceBrand = request.DeviceBrand,
            DeviceModel = request.DeviceModel,
            Imei = request.Imei,
            IssueDescription = request.IssueDescription,
            EstimatedCost = request.EstimatedCost,
            EstimatedCompletion = request.EstimatedCompletion,
            Accessories = request.Accessories,
            Photos = (request.Photos != null && request.Photos.Count > 0)
                ? JsonSerializer.Serialize(request.Photos)
                : null,
            Status = "recibido"
        };

        _db.Repairs.Add(repair);
        await _db.SaveChangesAsync();

        repair.Client = client;
        return ToResponse(repair);
    }

    public async Task<RepairResponse> UpdateRepairAsync(Guid id, RepairUpdateRequest request)
    {
        var repair = await _db.Repairs.Include(r => r.Client)
                         .FirstOrDefaultAsync(r => r.Id == id)
                     ?? throw new KeyNotFoundException("Orden no encontrada");

        if (request.DeviceBrand is not null) repair.DeviceBrand = request.DeviceBrand;
        if (request.DeviceModel is not null) repair.DeviceModel = request.DeviceModel;
        if (request.Imei is not null) repair.Imei = request.Imei;
        if (request.IssueDescription is not null) repair.IssueDescription = request.IssueDescription;
        if (request.EstimatedCost.HasValue) repair.EstimatedCost = request.EstimatedCost;
        if (request.FinalCost.HasValue) repair.FinalCost = request.FinalCost;
        if (request.TechnicianNotes is not null) repair.TechnicianNotes = request.TechnicianNotes;
        if (request.EstimatedCompletion is not null) repair.EstimatedCompletion = request.EstimatedCompletion;
        if (request.Accessories is not null) repair.Accessories = request.Accessories;
        if (request.RepairResult is not null) repair.RepairResult = request.RepairResult;

        repair.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return ToResponse(repair);
    }

    public async Task<RepairResponse> UpdateStatusAsync(Guid id, string newStatus)
    {
        if (!ValidStatuses.Contains(newStatus))
            throw new ArgumentException($"Estado inválido. Estados válidos: {string.Join(", ", ValidStatuses)}");

        var repair = await _db.Repairs.Include(r => r.Client)
                         .FirstOrDefaultAsync(r => r.Id == id)
                     ?? throw new KeyNotFoundException("Orden no encontrada");

        // Prevent backward status transitions
        var currentIndex = Array.IndexOf(ValidStatuses, repair.Status);
        var newIndex = Array.IndexOf(ValidStatuses, newStatus);
        if (newIndex < currentIndex)
            throw new InvalidOperationException(
                $"No se puede retroceder el estado de '{repair.Status}' a '{newStatus}'. El flujo de estados es unidireccional.");

        repair.Status = newStatus;

        // When delivered: auto-fill FinalCost from EstimatedCost if not already set
        if (newStatus == "entregado" && !repair.FinalCost.HasValue && repair.EstimatedCost.HasValue)
            repair.FinalCost = repair.EstimatedCost;

        repair.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return ToResponse(repair);
    }

    public async Task DeleteRepairAsync(Guid id)
    {
        var repair = await _db.Repairs.FindAsync(id)
            ?? throw new KeyNotFoundException("Orden no encontrada");
        _db.Repairs.Remove(repair);
        await _db.SaveChangesAsync();
    }

    public async Task<DashboardStatsResponse> GetDashboardStatsAsync()
    {
        var todayStart = DateTime.UtcNow.Date;

        var repairs = await _db.Repairs.Include(r => r.Client).ToListAsync();
        var totalClients = await _db.Clients.CountAsync();

        var statusCounts = new Dictionary<string, int>();
        foreach (var s in ValidStatuses)
            statusCounts[s] = repairs.Count(r => r.Status == s);

        var recentRepairs = repairs
            .OrderByDescending(r => r.CreatedAt)
            .Take(5)
            .Select(r => ToResponse(r))
            .ToList();

        return new DashboardStatsResponse
        {
            TotalRepairs = repairs.Count,
            TotalClients = totalClients,
            PendingRepairs = repairs.Count(r => r.Status != "entregado"),
            CompletedToday = repairs.Count(r => r.Status == "entregado" && r.UpdatedAt >= todayStart),
            StatusCounts = statusCounts,
            RecentRepairs = recentRepairs,
            TotalRevenue = repairs
                .Where(r => r.Status == "entregado" && r.FinalCost.HasValue)
                .Sum(r => r.FinalCost!.Value)
        };
    }

    // ── Helpers ──────────────────────────────────────────────────

    private static string GenerateOrderNumber()
        => $"TF-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..4].ToUpper()}";

    public async Task<TrackingResponse> GetRepairTrackingAsync(string orderNumber)
    {
        var repair = await _db.Repairs
            .FirstOrDefaultAsync(r => r.OrderNumber == orderNumber)
            ?? throw new KeyNotFoundException("Orden no encontrada");

        // Read the configured shop name from settings (falls back to default if not set)
        var settings = await _db.ShopSettings.FirstOrDefaultAsync();
        var shopName = settings?.ShopName ?? "Taller de Reparaciones";

        return new TrackingResponse
        {
            OrderNumber  = repair.OrderNumber,
            DeviceBrand  = repair.DeviceBrand,
            DeviceModel  = repair.DeviceModel,
            Status       = repair.Status,
            EstimatedCompletion = repair.EstimatedCompletion,
            RepairResult = repair.RepairResult,
            CreatedAt    = repair.CreatedAt,
            UpdatedAt    = repair.UpdatedAt,
            ShopName     = shopName
        };
    }

    private static RepairResponse ToResponse(RepairOrder r) => new()
    {
        Id = r.Id,
        OrderNumber = r.OrderNumber,
        ClientId = r.ClientId,
        ClientName = r.Client?.Name,
        ClientPhone = r.Client?.Phone,
        DeviceBrand = r.DeviceBrand,
        DeviceModel = r.DeviceModel,
        Imei = r.Imei,
        IssueDescription = r.IssueDescription,
        Status = r.Status,
        EstimatedCost = r.EstimatedCost,
        FinalCost = r.FinalCost,
        TechnicianNotes = r.TechnicianNotes,
        Accessories = r.Accessories,
        EstimatedCompletion = r.EstimatedCompletion,
        Photos = string.IsNullOrEmpty(r.Photos)
            ? null
            : JsonSerializer.Deserialize<List<string>>(r.Photos),
        RepairResult = r.RepairResult,
        CreatedAt = r.CreatedAt,
        UpdatedAt = r.UpdatedAt
    };
}
