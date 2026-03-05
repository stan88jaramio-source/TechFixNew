using TechFix.API.DTOs.Clients;

namespace TechFix.API.Services;

public interface IClientService
{
    Task<List<ClientResponse>> GetClientsAsync(string? search);
    Task<ClientResponse> GetClientAsync(Guid id);
    Task<ClientResponse> CreateClientAsync(ClientCreateRequest request);
    Task<ClientResponse> UpdateClientAsync(Guid id, ClientUpdateRequest request);
    Task DeleteClientAsync(Guid id);
}
