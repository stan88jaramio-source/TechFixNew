using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechFix.API.Services;

namespace TechFix.API.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IRepairService _repairs;

    public DashboardController(IRepairService repairs) => _repairs = repairs;

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var stats = await _repairs.GetDashboardStatsAsync();
        return Ok(stats);
    }
}
