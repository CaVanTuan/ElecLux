using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Models;
using System.Security.Claims;

namespace Controllers
{
    [ApiController]
    [Route("api/notifications")]
    public class NotificationController : ControllerBase
    {
        private readonly AppDbContext _context;
        public NotificationController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> CreateNotification([FromBody] CreateNotificationRequest request)
        {
            var noti = new Notification
            {
                UserId = request.UserId,
                Type = request.Type,
                Message = request.Message,
                Status = "Chưa đọc",
                CreatedAt = DateTime.Now
            };
            _context.Notifications.Add(noti);
            await _context.SaveChangesAsync();
            return Ok(noti);
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetMyNoti()
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var noti = await _context.Notifications
            .Where(c => c.UserId == int.Parse(currentUserId))
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
            return Ok(noti);
        }

        [HttpPut("mark-read/{notiId}")]
        [Authorize]
        public async Task<IActionResult> MarkReadNoti(int notiId)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var noti = await _context.Notifications
            .FirstOrDefaultAsync(c => c.UserId == int.Parse(currentUserId) && c.NotificationId == notiId);
            if (noti == null) return NotFound("Thông báo không tồn tại.");
            noti.Status = "Đã đọc";
            _context.Notifications.Update(noti);
            await _context.SaveChangesAsync();
            return Ok(noti);
        }
    }
    public class CreateNotificationRequest
    {
        public int UserId { get; set; }
        public string Type { get; set; }
        public string Message { get; set; }
    }
}