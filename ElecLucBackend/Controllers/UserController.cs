using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Models;
using Microsoft.AspNetCore.Authorization;

namespace Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;
        public UserController(AppDbContext context)
        {
            _context = context;
        }

        //Tạo mới người dùng
        [HttpPost("user")]
        public async Task<ActionResult<User>> CreateUser([FromBody] CreateUserRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Name == request.Name)) return BadRequest("Tên người dùng đã tồn tại.");
            var user = new User
            {
                Name = request.Name,
                Email = request.Email,
                Password = request.Password,
                Phone = BCrypt.Net.BCrypt.HashPassword(request.Phone),
                Address = request.Address,
                Role = "user"
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetUser), new { userId = user.UserId }, user);
        }

        //Tạo mới quản trị viên
        [HttpPost("admin")]
        public async Task<ActionResult<User>> CreateAdmin([FromBody] CreateUserRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Name == request.Name)) return BadRequest("Tên người dùng đã tồn tại.");
            var user = new User
            {
                Name = request.Name,
                Email = request.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Phone = request.Phone,
                Address = request.Address,
                Role = "admin"
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetUser), new { userId = user.UserId }, user);
        }

        //Lấy người dùng theo id
        [HttpGet("{userId}")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<User>> GetUser(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound("Người dùng không tồn tại");
            return user;
        }

        [HttpGet("get-me")]
        [Authorize]
        public async Task<ActionResult<User>> GetCurrentUser()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized("Chưa đăng nhập"); 
            var user = await _context.Users.FirstOrDefaultAsync(c => c.UserId == int.Parse(userIdClaim.Value));
            return Ok(user);
        }

        [HttpGet("getAllUser")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<IEnumerable<User>>> GetAllUser()
        {
            var users = await _context.Users.ToListAsync();
            return Ok(users);
        }

        [HttpDelete("{userId}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteUserById(int userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(c => c.UserId == userId);
            if (user == null) return NotFound("Không tìm thấy người dùng");
            _context.Users.Remove(user);
            return Ok("Xóa thành công.");
        }

        [HttpPut("{userId}/change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword(int userId, [FromBody] ChangePasswordRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(c => c.UserId == userId);
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userId != int.Parse(currentUserId.Value)) return Forbid("Bạn không có quyền");
            if (user == null) return NotFound("Không tìm thấy người dùng");
            if (user.Password != request.OldPasswordRequest) return BadRequest("Mật khẩu cũ không đúng");
            user.Password = request.NewPasswordRequest;
            await _context.SaveChangesAsync();
            return Ok("Đổi mật khẩu thành công");
        }
    }
    public class CreateUserRequest
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Phone { get; set; }
        public string Address { get; set; }
    }
    public class ChangePasswordRequest
    {
        public string OldPasswordRequest { get; set; }
        public string NewPasswordRequest{ get; set; }
    }
}