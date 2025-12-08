using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Models;
using System.Security.Claims;

namespace Controllers
{
    [ApiController]
    [Route("api/bookings")]
    public class BookingController : ControllerBase
    {
        private readonly AppDbContext _context;
        public BookingController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateBooking([FromBody] CreateBookingRequest request)
        {
            var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var curentUser = await _context.Users.FindAsync(currentUserId);
            if (curentUser == null) return NotFound("Người dùng không tồn tại");

            var car = await _context.Cars.FindAsync(request.CarId);
            if (car == null) return NotFound("Xe không tồn tại");

            var rentalPlan = await _context.RentalPlans
                .FirstOrDefaultAsync(c => c.DurationType == request.DurationType && c.CarId == request.CarId);
            if (rentalPlan == null) return NotFound("Không tồn tại gói thuê này cho xe này");

            // Tạo booking
            DateTime endDate = request.StartDate;
            switch (request.DurationType)
            {
                case "Ngày": endDate = request.StartDate.AddDays(1); break;
                case "Tháng": endDate = request.StartDate.AddMonths(1); break;
                case "Năm": endDate = request.StartDate.AddYears(1); break;
            }

            var booking = new Booking
            {
                CarId = car.CarId,
                PlanId = rentalPlan.PlanId,
                StartDate = request.StartDate,
                EndDate = endDate,
                Status = "Confirmed",
                TotalPrice = rentalPlan.Price,
                UserId = currentUserId
            };
            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            // Nếu có promo, tạo luôn BookingPromotion
            if (request.PromoId.HasValue)
            {
                var bookingPromotion = new BookingPromotion
                {
                    BookingId = booking.BookingId,
                    PromoId = request.PromoId.Value
                };
                _context.BookingPromotions.Add(bookingPromotion);
                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                message = "Booking tạo thành công",
                booking
            });
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetBookingOfCurrentUser()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            var bookings = await _context.Bookings
                .Include(b => b.Car)
                .Include(b => b.Plan)
                .Include(b => b.Payments)
                .Include(b => b.BookingPromotions)
                    .ThenInclude(bp => bp.Promotion)
                .Where(b => b.UserId == userId)
                .ToListAsync();

            var result = bookings.Select(b => new
            {
                b.BookingId,
                Car = new
                {
                    b.Car.CarId,
                    b.Car.Name,
                    b.Car.Type,
                    b.Car.Seats,
                    b.Car.RangeKm,
                    b.Car.ImageUrl
                },
                Plan = new
                {
                    b.Plan.PlanId,
                    b.Plan.DurationType,
                    b.Plan.Price
                },
                b.StartDate,
                b.EndDate,
                b.TotalPrice,
                b.Status,
                LastPayment = b.Payments
                .OrderByDescending(p => p.PaymentDate)
                .Select(p => new { p.PaymentId, p.Amount, p.PaymentDate })
                .FirstOrDefault(),
                Promo = b.BookingPromotions
                .Select(bp => new
                {
                    bp.Promotion.PromoId,
                    bp.Promotion.Code,
                    bp.Promotion.DiscountPercent
                })
                .FirstOrDefault()
            });

            return Ok(result);
        }

        [HttpGet("All")]
        public async Task<IActionResult> GetAllOrder()
        {
            var bookings = await _context.Bookings
                .Include(b => b.Car)
                .Include(b => b.Plan)
                .Include(b => b.Payments)
                .Include(b => b.BookingPromotions)
                    .ThenInclude(bp => bp.Promotion)
                .ToListAsync();

            var result = bookings.Select(b => new
            {
                b.BookingId,
                Car = new
                {
                    b.Car.CarId,
                    b.Car.Name,
                    b.Car.Type,
                    b.Car.Seats,
                    b.Car.RangeKm,
                    b.Car.ImageUrl
                },
                Plan = new
                {
                    b.Plan.PlanId,
                    b.Plan.DurationType,
                    b.Plan.Price
                },
                b.StartDate,
                b.EndDate,
                b.TotalPrice,
                b.Status,
                LastPayment = b.Payments
                .OrderByDescending(p => p.PaymentDate)
                .Select(p => new { p.PaymentId, p.Amount, p.PaymentDate })
                .FirstOrDefault(),
                        Promo = b.BookingPromotions
                .Select(bp => new
                {
                    bp.Promotion.PromoId,
                    bp.Promotion.Code,
                    bp.Promotion.DiscountPercent
                })
                .FirstOrDefault()
            });

            return Ok(result);
        }

        [HttpPut("update-status/{bookingId}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> UpdateBookingStatus(int bookingId)
        {
            var booking = await _context.Bookings
            .FirstOrDefaultAsync(c => c.BookingId == bookingId);
            if (booking == null) return NotFound("Đơn không tồn tại");
            booking.Status = "Completed";
            _context.Bookings.Update(booking);
            await _context.SaveChangesAsync();
            return Ok("Đơn đã hoàn thành");
        }
    }
    public class CreateBookingRequest
    {
        public int CarId { get; set; }
        public string DurationType { get; set; }
        public DateTime StartDate { get; set; }
        public int? PromoId { get; set; }
    }
}