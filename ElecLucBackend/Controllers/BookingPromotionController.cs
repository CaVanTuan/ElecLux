using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Models;
using System.Security.Claims;

namespace Controllers
{
    [ApiController]
    [Route("api/bookingPromotions")]
    public class BookingPromotionController : ControllerBase
    {
        private readonly AppDbContext _context;
        public BookingPromotionController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("All")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetAllBookingnPromotion()
        {
            var listOfBookingPromotions = await _context.BookingPromotions.ToListAsync();
            return Ok(listOfBookingPromotions);
        }

        [HttpGet("my-bookingPromo")]
        [Authorize]
        public async Task<IActionResult> GetMyBookingPromotion()
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var listOfBookingPromotions = await _context.BookingPromotions
            .Where(c => c.Booking.UserId == int.Parse(currentUserId))
            .Include(c => c.Promotion)
            .ToListAsync();
            return Ok(listOfBookingPromotions);
        }
    }
}