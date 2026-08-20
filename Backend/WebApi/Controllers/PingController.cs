using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PingController : ControllerBase
{
    [AllowAnonymous]
    [HttpGet]
    public IActionResult Ping()
    {
        return Ok(new { message = "Server is alive", timestamp = System.DateTime.UtcNow });
    }
}