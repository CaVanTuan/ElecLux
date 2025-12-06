using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Models;

namespace Controllers
{
    [ApiController]
    [Route("api/promotions")]
    public class PromotionController : ControllerBase
    {
        private readonly AppDbContext _context;
        public PromotionController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> CreatePromotion([FromBody] CreatePromotionRequest request)
        {
            var existingPromo = await _context.Promotions.FirstOrDefaultAsync(c => c.DiscountPercent == request.DiscountPercent && c.Status == PromotionStatus.Active);
            if (existingPromo != null) return BadRequest("Đã có mã giảm giá tương tự");
            var newPromo = new Promotion
            {
                Code = "ElecLuxCode" + DateTime.Now.Ticks,
                Description = request.Description,
                DiscountPercent = request.DiscountPercent,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Status = PromotionStatus.Active
            };
            _context.Promotions.Add(newPromo);
            await _context.SaveChangesAsync();
            return Ok(newPromo);
        }

        [HttpGet("All")]
        public async Task<IActionResult> GetAllPromotion()
        {
            var listOfPromotions = await _context.Promotions.ToListAsync();
            return Ok(listOfPromotions);
        }

        [HttpPut("update/{promoId}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> UpdatePromo(int promoId, [FromBody] CreatePromotionRequest request)
        {
            var promo = await _context.Promotions.FirstOrDefaultAsync(c => c.PromoId == promoId);
            if (promo == null) return NotFound("Mã giảm giá này không tồn tại");
            if (request.StartDate > request.EndDate) return BadRequest("Ngày kết thúc phải lớn hơn ngày bắt đầu");
            promo.Description = request.Description;
            promo.DiscountPercent = request.DiscountPercent;
            promo.StartDate = request.StartDate;
            promo.EndDate = request.EndDate;
            _context.Promotions.Update(promo);
            await _context.SaveChangesAsync();
            return Ok("Cập nhật mã giảm giá thành công");
        }

        [HttpPut("update-status/{promoId}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> UpdateStatusPromo(int promoId, [FromBody] UpdateStatusPromoRequest request)
        {
            var promo = await _context.Promotions.FirstOrDefaultAsync(c => c.PromoId == promoId);
            if (promo == null) return NotFound("Mã giảm giá này không tồn tại");
            promo.Status = request.status;
            _context.Promotions.Update(promo);
            await _context.SaveChangesAsync();
            return Ok(
                new
                {
                    message = "Cập nhật trạng thái thành công",
                    promotion = promo
                }
            );
        }

        [HttpDelete("delete/{promoId}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeletePromo(int promoId)
        {
            var promo = await _context.Promotions.FirstOrDefaultAsync(c => c.PromoId == promoId);
            if (promo == null) return NotFound("Mã giảm giá không tồn tại");
            _context.Promotions.Remove(promo);
            await _context.SaveChangesAsync();
            return Ok("Xóa mã giảm giá thành công");
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActivePromotions()
        {
            var now = DateTime.UtcNow;
            var promotions = await _context.Promotions
                .Where(p => p.Status == PromotionStatus.Active && p.StartDate <= now && p.EndDate >= now)
                .ToListAsync();
            return Ok(promotions);
        }

        [HttpGet("get-by-code")]
        public async Task<IActionResult> GetPromotionByCode([FromQuery] string code)
        {
            var promo = await _context.Promotions
                .FirstOrDefaultAsync(p => p.Code == code && p.Status == PromotionStatus.Active);
            if (promo == null) return NotFound("Mã giảm giá không tồn tại");
            return Ok(promo);
        }

        [HttpPost("create-fake")]
        public async Task<IActionResult> CreateFakePromotion()
        {
            var fakePromo = new Promotion
            {
                Code = "PROMO" + DateTime.Now.Ticks,
                Description = "Mã giảm giá giả để test",
                DiscountPercent = new Random().Next(5, 25),
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddDays(7),
                Status = PromotionStatus.Active
            };

            _context.Promotions.Add(fakePromo);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Fake promo đã được tạo",
                promotion = fakePromo
            });
        }

    }
    public class UpdateStatusPromoRequest
    {
        public PromotionStatus status { get; set; }
    }
    public class CreatePromotionRequest
    {
        public string Description { get; set; }
        public double DiscountPercent { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }
}