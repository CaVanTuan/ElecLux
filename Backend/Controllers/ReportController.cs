using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Models;

namespace Controllers
{
    [ApiController]
    [Route("api/reports")]
    public class ReportController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReportController(AppDbContext context)
        {
            _context = context;
        }
        [HttpGet("revenue")]
        public async Task<IActionResult> GetRevenue(int? carId, int? planId, string groupBy = "month")
        {
            var bookings = _context.Bookings
                .Include(b => b.Payments)
                .AsQueryable();

            if (carId != null)
                bookings = bookings.Where(b => b.CarId == carId);

            if (planId != null)
                bookings = bookings.Where(b => b.PlanId == planId);

            var data = bookings
                .Select(b => new
                {
                    Date = b.StartDate,
                    Amount = b.Payments.Sum(p => p.Amount)
                })
                .AsEnumerable();

            var result = groupBy.ToLower() switch
            {
                "day" => data.GroupBy(x => x.Date.ToString("yyyy-MM-dd"))
                             .Select(g => new { Label = g.Key, Revenue = g.Sum(x => x.Amount) }),

                "year" => data.GroupBy(x => x.Date.ToString("yyyy"))
                              .Select(g => new { Label = g.Key, Revenue = g.Sum(x => x.Amount) }),

                _ => data.GroupBy(x => x.Date.ToString("yyyy-MM"))
                         .Select(g => new { Label = g.Key, Revenue = g.Sum(x => x.Amount) })
            };

            return Ok(result);
        }

        [HttpGet("top-plans")]
        public async Task<IActionResult> GetTopPlans(int top = 5)
        {
            var result = await _context.Bookings
                .Include(b => b.Plan)
                .Include(b => b.Car)
                .GroupBy(b => new { b.Plan.PlanId, b.Car.Name, b.Plan.DurationType })
                .Select(g => new
                {
                    PlanId = g.Key.PlanId,
                    Plan = $"{g.Key.Name} - {g.Key.DurationType}",
                    Count = g.Count()
                })
                .OrderByDescending(x => x.Count)
                .Take(top)
                .ToListAsync();

            return Ok(result);
        }

        [HttpGet("bookings")]
        public async Task<IActionResult> GetBookingStats(int? carId, int? planId)
        {
            var query = _context.Bookings.AsQueryable();

            if (carId.HasValue) query = query.Where(b => b.CarId == carId.Value);
            if (planId.HasValue) query = query.Where(b => b.PlanId == planId.Value);

            var data = await query.GroupBy(b => new { b.Status, b.CreatedAt.Date })
                                  .Select(g => new { Date = g.Key.Date, Status = g.Key.Status, Count = g.Count() })
                                  .OrderBy(x => x.Date)
                                  .ThenBy(x => x.Status)
                                  .ToListAsync();

            return Ok(data);
        }

        [HttpGet("top-cars")]
        public async Task<IActionResult> GetTopCars(int top = 5)
        {
            var data = await _context.Bookings
                .GroupBy(b => b.CarId)
                .Select(g => new
                {
                    CarId = g.Key,
                    CarName = g.FirstOrDefault()!.Car.Name,
                    BookedCount = g.Count()
                })
                .OrderByDescending(x => x.BookedCount)
                .Take(top)
                .ToListAsync();

            return Ok(data);
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            // Tổng user
            var totalUsers = await _context.Users.CountAsync();

            // Feedback
            var totalFeedbacks = await _context.Feedbacks.CountAsync();

            // Khuyến mãi
            var totalPromotions = await _context.Promotions.CountAsync();

            // Tổng số xe
            var totalCars = await _context.Cars.CountAsync();

            // Tổng số xe đang có booking (coi như active)
            var activeCars = await _context.Bookings
                .Select(b => b.CarId)
                .Distinct()
                .CountAsync();

            // Tổng số booking
            var totalBookings = await _context.Bookings.CountAsync();

            // Tổng doanh thu (tính theo payment)
            var totalRevenue = await _context.Payments.SumAsync(p => p.Amount);

            return Ok(new
            {
                totalUsers,
                totalFeedbacks,
                totalPromotions,
                totalCars,
                activeCars,
                totalBookings,
                totalRevenue
            });
        }
    }
}