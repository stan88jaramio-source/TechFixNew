using Microsoft.EntityFrameworkCore;
using TechFix.API.Data;
using TechFix.API.DTOs.Clients;
using TechFix.API.Models;

namespace TechFix.API.Services;

public class ClientService : IClientService
{
    private readonly AppDbContext _db;

    public ClientService(AppDbContext db) => _db = db;

    public async Task<List<ClientResponse>> GetClientsAsync(string? search)
    {
        var query = _db.Clients.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var lower = search.ToLower();
            query = query.Where(c =>
                c.Name.ToLower().Contains(lower) ||
                c.Phone.ToLower().Contains(lower) ||
                (c.Email != null && c.Email.ToLower().Contains(lower)));
        }

        var clients = await query
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new ClientResponse
            {
                Id = c.Id,
                Name = c.Name,
                Phone = c.Phone,
                Email = c.Email,
                Address = c.Address,
                CreatedAt = c.CreatedAt,
                TotalRepairs = c.Repairs.Count
            })
            .ToListAsync();

        return clients;
    }

    public async Task<ClientResponse> GetClientAsync(Guid id)
    {
        var c = await _db.Clients
            .Include(x => x.Repairs)
            .FirstOrDefaultAsync(x => x.Id == id)
            ?? throw new KeyNotFoundException("Cliente no encontrado");

        return ToResponse(c);
    }

    public async Task<ClientResponse> CreateClientAsync(ClientCreateRequest request)
    {
        var client = new Client
        {
            Name = request.Name,
            Phone = request.Phone,
            Email = request.Email,
            Address = request.Address
        };

        _db.Clients.Add(client);
        await _db.SaveChangesAsync();
        return ToResponse(client);
    }

    public async Task<ClientResponse> UpdateClientAsync(Guid id, ClientUpdateRequest request)
    {
        var client = await _db.Clients.FindAsync(id)
            ?? throw new KeyNotFoundException("Cliente no encontrado");

        if (request.Name is not null) client.Name = request.Name;
        if (request.Phone is not null) client.Phone = request.Phone;
        if (request.Email is not null) client.Email = request.Email;
        if (request.Address is not null) client.Address = request.Address;

        await _db.SaveChangesAsync();
        return await GetClientAsync(id);
    }

    public async Task DeleteClientAsync(Guid id)
    {
        var client = await _db.Clients.FindAsync(id)
            ?? throw new KeyNotFoundException("Cliente no encontrado");

        _db.Clients.Remove(client);
        await _db.SaveChangesAsync();
    }

    private static ClientResponse ToResponse(Client c) => new()
    {
        Id = c.Id,
        Name = c.Name,
        Phone = c.Phone,
        Email = c.Email,
        Address = c.Address,
        CreatedAt = c.CreatedAt,
        TotalRepairs = c.Repairs?.Count ?? 0
    };
}
