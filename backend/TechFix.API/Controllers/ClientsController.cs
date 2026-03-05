using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechFix.API.DTOs.Clients;
using TechFix.API.Services;

namespace TechFix.API.Controllers;

[ApiController]
[Route("api/clients")]
[Authorize]
public class ClientsController : ControllerBase
{
    private readonly IClientService _clients;

    public ClientsController(IClientService clients) => _clients = clients;

    [HttpGet]
    public async Task<IActionResult> GetClients([FromQuery] string? search)
    {
        var result = await _clients.GetClientsAsync(search);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetClient(Guid id)
    {
        try
        {
            var result = await _clients.GetClientAsync(id);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateClient([FromBody] ClientCreateRequest request)
    {
        var result = await _clients.CreateClientAsync(request);
        return CreatedAtAction(nameof(GetClient), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateClient(Guid id, [FromBody] ClientUpdateRequest request)
    {
        try
        {
            var result = await _clients.UpdateClientAsync(id, request);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteClient(Guid id)
    {
        try
        {
            await _clients.DeleteClientAsync(id);
            return Ok(new { message = "Cliente eliminado exitosamente" });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }
}
