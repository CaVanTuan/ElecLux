using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Models;
using System.Security.Claims;

namespace Controllers
{
    [ApiController]
    [Route("api/feedbacks")]
    public class FeedbackController : ControllerBase
    {
        private readonly AppDbContext _context;
        public FeedbackController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateFeedback([FromBody] CreateFeedbackRequest request)
        {
            var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var feedback = new Feedback
            {
                UserId = currentUserId,
                CarId = request.CarId,
                Rating = request.Rating,
                Comment = request.Comment,
                CreatedAt = DateTime.Now
            };
            _context.Feedbacks.Add(feedback);
            await _context.SaveChangesAsync();
            return Ok(feedback);
        }

        [HttpGet("All")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetAllFeedback()
        {
            var feedbacks = await _context.Feedbacks
                .Include(c => c.User)
                .Include(c => c.Car)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();

            var result = feedbacks.Select(c => new
            {
                c.FeedbackId,
                UserName = c.User.Name,
                CarName = c.Car.Name,
                c.Rating,
                c.Comment,
                c.CreatedAt
            });

            return Ok(result);
        }

        [HttpGet("{carId}")]
        public async Task<IActionResult> GetFeedbackByCarId(int carId)
        {
            var car = await _context.Cars.FirstOrDefaultAsync(c => c.CarId == carId);
            if (car == null) return NotFound("Không tồn tại xe này");
            var listOfFeedback = await _context.Feedbacks
            .Where(c => c.CarId == carId)
            .Include(c => c.User)
            .ToListAsync();
            return Ok(listOfFeedback);
        }

        [HttpPut("{feedbackId}")]
        [Authorize]
        public async Task<IActionResult> UpdateFeedback(int feedbackId, [FromBody] UpdateFeedbackRequest request)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var feedback = await _context.Feedbacks.FirstOrDefaultAsync(c => c.FeedbackId == feedbackId);
            if (int.Parse(currentUserId) != feedback.UserId) return Forbid("Bạn không có quyền hạn này.");
            feedback.Rating = request.Rating;
            feedback.Comment = request.Comment;
            feedback.CreatedAt = DateTime.Now;
            _context.Feedbacks.Update(feedback);
            await _context.SaveChangesAsync();
            return Ok(
                new
                {
                    message = "Cập nhật đánh giá thành công",
                    fb = feedback
                }
            );
        }

        [HttpDelete("{feedbackId}")]
        [Authorize]
        public async Task<IActionResult> DeleteFeedback(int feedbackId)
        {
            var feedback = await _context.Feedbacks.FirstOrDefaultAsync(c => c.FeedbackId == feedbackId);
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (feedback.UserId != int.Parse(currentUserId)) return Forbid("Bạn không có quyền hạn này");
            _context.Feedbacks.Remove(feedback);
            await _context.SaveChangesAsync();
            return Ok("Xóa thành công đánh giá");
        }
    }
    public class UpdateFeedbackRequest
    {
        public int Rating { get; set; }
        public string Comment{ get; set; }
    }
    public class CreateFeedbackRequest
    {
        public int CarId { get; set; }
        public int Rating { get; set; }
        public string Comment{ get; set; }
    }
}