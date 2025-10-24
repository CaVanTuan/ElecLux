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
        [Authorize(Roles = "admin")]
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
                    promotion =  promo
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
    }
    public class UpdateStatusPromoRequest
    {
        public PromotionStatus status{ get; set; }
    }
    public class CreatePromotionRequest
    {
        public string Description { get; set; }
        public double DiscountPercent { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate{ get; set; }
    }
}