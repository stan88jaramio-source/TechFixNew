using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechFix.API.DTOs.Repairs;
using TechFix.API.Services;

namespace TechFix.API.Controllers;

[ApiController]
[Route("api/repairs")]
[Authorize]
public class RepairsController : ControllerBase
{
    private readonly IRepairService _repairs;

    public RepairsController(IRepairService repairs) => _repairs = repairs;

    /// Endpoint público: el cliente accede con el número de orden sin autenticación
    [AllowAnonymous]
    [HttpGet("track/{orderNumber}")]
    public async Task<IActionResult> TrackRepair(string orderNumber)
    {
        try
        {
            var result = await _repairs.GetRepairTrackingAsync(orderNumber);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }
    [HttpGet]
    public async Task<IActionResult> GetRepairs(
        [FromQuery] string? status,
        [FromQuery] string? search,
        [FromQuery] Guid? clientId)
    {
        var result = await _repairs.GetRepairsAsync(status, search, clientId);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetRepair(Guid id)
    {
        try
        {
            var result = await _repairs.GetRepairAsync(id);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateRepair([FromBody] RepairCreateRequest request)
    {
        try
        {
            var result = await _repairs.CreateRepairAsync(request);
            return CreatedAtAction(nameof(GetRepair), new { id = result.Id }, result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateRepair(Guid id, [FromBody] RepairUpdateRequest request)
    {
        try
        {
            var result = await _repairs.UpdateRepairAsync(id, request);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] StatusUpdateRequest request)
    {
        try
        {
            var result = await _repairs.UpdateStatusAsync(id, request.Status);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { detail = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { detail = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteRepair(Guid id)
    {
        try
        {
            await _repairs.DeleteRepairAsync(id);
            return Ok(new { message = "Orden eliminada exitosamente" });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }
}
