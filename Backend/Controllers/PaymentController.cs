using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Models;
using System.Security.Claims;

namespace Controllers
{
    [ApiController]
    [Route("api/payments")]
    public class PaymentController : ControllerBase
    {
        private readonly AppDbContext _context;
        public PaymentController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentRequest request)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var booking = await _context.Bookings
            .FirstOrDefaultAsync(c => c.BookingId == request.BookingId);
            if (booking == null) return NotFound();
            if (int.Parse(currentUserId) != booking.UserId) return Forbid();

            Promotion promo = null;
            if (request.PromoId.HasValue)
            {
                promo = await _context.Promotions
                .FirstOrDefaultAsync(c => c.PromoId == request.PromoId);
                if (promo == null) return NotFound("Mã giảm giá không tồn tại");
            }
            var payment = new Payment
            {
                Method = request.Method,
                BookingId = request.BookingId,
                Status = "Paid",
                PaymentDate = DateTime.Now
            };
            decimal finalAmount = booking.TotalPrice;
            if (promo != null)
            {
                finalAmount = booking.TotalPrice - booking.TotalPrice * (decimal)(promo.DiscountPercent / 100);
            }
            payment.Amount = finalAmount;
            if (request.Method == "COD") payment.Status = "Pending";
            if (payment.Status == "Paid") booking.Status = "Paid";
            _context.Payments.Add(payment);
            _context.Bookings.Update(booking);
            await _context.SaveChangesAsync();
            return Ok(payment);
        }

        [HttpGet("{paymentId}")]
        [Authorize]
        public async Task<IActionResult> GetPaymentById(int paymentId)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _context.Users.FirstOrDefaultAsync(c => c.UserId == int.Parse(currentUserId));
            if (user == null) return NotFound();
            if (user.Role == "user")
            {
                var payment = await _context.Payments
                .FirstOrDefaultAsync(c => c.Booking.UserId == user.UserId && c.PaymentId == paymentId);
                if (payment == null) return NotFound("Không tìm thấy thanh toán nào");
                return Ok(payment);
            }
            var paymentFul = await _context.Payments.FirstOrDefaultAsync(c => c.PaymentId == paymentId);
            return Ok(paymentFul);
        }
    }
    public class CreatePaymentRequest
    {
        public int BookingId { get; set; }
        public int? PromoId { get; set; }
        public string Method { get; set; }

    }
    public class UpdatePaymentRequest
    {
        public string Status{ get; set; }
    }
}