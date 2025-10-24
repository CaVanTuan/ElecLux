using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Models;
using System.Security.Claims;

namespace Controllers
{
    [ApiController]
    [Route("api/testDrives")]
    public class TestDriveController : ControllerBase
    {
        private readonly AppDbContext _context;
        public TestDriveController(AppDbContext context)
        {
            _context = context;
        }
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateTestDrive([FromBody] CreateTestDriveRequest request)
        {
            var car = await _context.Cars.FirstOrDefaultAsync(c => c.CarId == request.CarId);
            if (car == null) return NotFound("Xe không tồn tại");
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUser = await _context.Users.FirstOrDefaultAsync(c => c.UserId == int.Parse(currentUserId));
            if (request.Date < DateTime.Now) return BadRequest("Ngày đăng ký lái thử phải ở tương lai");
            var testDrive = new TestDrive
            {
                CarId = request.CarId,
                UserId = int.Parse(currentUserId),
                Date = request.Date,
                Status = "Pending"
            };
            _context.TestDrives.Add(testDrive);
            await _context.SaveChangesAsync();
            return Ok(
                new
                {
                    message = "Đăng ký lái thử thành công, chờ xác nhận từ admin",
                    td = testDrive
                }
            );
        }

        [HttpGet("All")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetAllTestDrive()
        {
            var listOfTestDrives = await _context.TestDrives.ToListAsync();
            return Ok(listOfTestDrives);
        }

        [HttpGet("get-by-status")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetTestDriveByStatus(string tdStatus)
        {
            var listOfTestDrives = await _context.TestDrives
            .Where(c => c.Status == tdStatus)
            .Include(c => c.Car)
            .Include(c => c.User)
            .ToListAsync();
            return Ok(listOfTestDrives);
        }

        [HttpPut("update-status/{tdId}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> UpdateTestDriveStatus(int tdId, [FromBody] UpdateTestDriveStatus update)
        {
            var testDrive = await _context.TestDrives.FirstOrDefaultAsync(c => c.TestDriveId == tdId);
            if (testDrive == null) return NotFound("Đơn đăng ký lái thử không tồn tại");
            testDrive.Status = update.Status;
            _context.TestDrives.Update(testDrive);
            await _context.SaveChangesAsync();
            return Ok("Cập nhật trạng thái thành công");
        }
    }
    public class CreateTestDriveRequest
    {
        public int CarId { get; set; }
        public DateTime Date { get; set; }
    }
    public class UpdateTestDriveStatus
    {
        public string Status{ get; set; }
    }
}