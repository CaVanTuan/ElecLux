using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Scraper;

namespace Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ScraperController : ControllerBase
    {
        private readonly AppDbContext _context;
        public ScraperController(AppDbContext context)
        {
            _context = context;
        }
        [HttpGet("run")]
        [AllowAnonymous]
        public async Task<IActionResult> RunScraper()
        {
            try
            {
                var scraper = new GreenFutureScraper(_context);
                await scraper.ScrapeCarsAsync();
                return Ok("Scraper đã chạy xong!");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Lỗi khi chạy scraper!",
                    error = ex.Message
                });
            }
        }
    }
}