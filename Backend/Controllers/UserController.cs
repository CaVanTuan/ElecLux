using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Caching.Memory;
using System.Net.Mail;
using System.Net;

namespace Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMemoryCache _cache;
        public UserController(AppDbContext context, IMemoryCache cache)
        {
            _context = context;
            _cache = cache;
        }

        [HttpPost("send-otp")]
        public IActionResult SendOtp([FromBody] SendOtpRequest request)
        {
            var normalizedEmail = request.EmailOrPhone.Trim().ToLower();
            var otp = new Random().Next(100000, 999999).ToString();

            _cache.Set($"OTP_{normalizedEmail}", otp, TimeSpan.FromMinutes(5));

            try
            {
                using var smtp = new SmtpClient("smtp.gmail.com")
                {
                    Port = 587,
                    Credentials = new NetworkCredential("sniper021003@gmail.com", "iwoj flbu lsjf kpnw"),
                    EnableSsl = true
                };

                var mail = new MailMessage
                {
                    From = new MailAddress("sniper021003@gmail.com"),
                    Subject = "OTP xác thực",
                    Body = $"Mã OTP của bạn là: {otp}",
                    IsBodyHtml = false
                };
                mail.To.Add(normalizedEmail);
                smtp.Send(mail);
            }
            catch (Exception ex)
            {
                return Ok(new ApiResponse<string>(104, null, "Gửi email thất bại: " + ex.Message));
            }

            return Ok(new ApiResponse<string>(200, null, "OTP đã được gửi, kiểm tra email"));
        }

        [HttpPost("verify-otp")]
        public IActionResult VerifyOtp([FromBody] VerifyOtpRequest request)
        {
            var normalizedEmail = request.EmailOrPhone.Trim().ToLower();

            if (!_cache.TryGetValue($"OTP_{normalizedEmail}", out string cachedOtp))
                return Ok(new ApiResponse<string>(101, null, "OTP hết hạn hoặc chưa được gửi"));

            if (cachedOtp != request.Otp)
                return Ok(new ApiResponse<string>(102, null, "OTP không đúng"));

            _cache.Remove($"OTP_{normalizedEmail}");
            return Ok(new ApiResponse<string>(200, null, "Xác thực OTP thành công"));
        }

        [HttpPut("update-user")]
        [Authorize]
        public async Task<IActionResult> UpdateUser([FromBody] UpdateUserRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            var userId = int.Parse(userIdClaim.Value);
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null) return NotFound();

            // Nếu đổi email, kiểm tra OTP
            if (!string.Equals(user.Email, request.Email, StringComparison.OrdinalIgnoreCase))
            {
                var normalizedEmail = request.Email.Trim().ToLower();

                if (!_cache.TryGetValue($"OTP_{normalizedEmail}", out string cachedOtp))
                    return Ok(new ApiResponse<string>(101, null, "OTP hết hạn hoặc chưa được gửi"));

                if (cachedOtp != request.Otp)
                    return Ok(new ApiResponse<string>(102, null, "OTP không đúng"));

                _cache.Remove($"OTP_{normalizedEmail}");
                user.Email = request.Email;
            }

            user.Name = request.Name;
            user.Phone = request.Phone;
            user.Address = request.Address;

            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<User>(200, user, "Cập nhật thông tin thành công"));
        }

        //Tạo mới người dùng
        [HttpPost("user")]
        public async Task<ActionResult<User>> CreateUser([FromBody] CreateUserRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                return Ok(new ApiResponse<string>(123, null, "Email người dùng đã tồn tại."));

            if (await _context.Users.AnyAsync(u => u.Phone == request.Phone))
                return Ok(new ApiResponse<string>(124, null, "SDT người dùng đã tồn tại."));

            if (await _context.Users.AnyAsync(u => u.Name == request.Name))
                return Ok(new ApiResponse<string>(125, null, "Tên người dùng đã tồn tại."));

            var user = new User
            {
                Name = request.Name,
                Email = request.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Phone = request.Phone,
                Address = request.Address,
                Role = "user"
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetUser), new { userId = user.UserId },
        new ApiResponse<User>(201, user, "Tạo tài khoản thành công!"));
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
            if (!BCrypt.Net.BCrypt.Verify(request.OldPasswordRequest, user.Password))
            {
                return BadRequest("Mật khẩu cũ không đúng");
            }

            user.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPasswordRequest);
            await _context.SaveChangesAsync();
            return Ok("Đổi mật khẩu thành công");
        }

        [HttpPut("{userId}/toggle-delete")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> ToggleDeleteUser(int userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null) return NotFound("Người dùng không tồn tại");

            user.IsDeleted = !user.IsDeleted;
            await _context.SaveChangesAsync();

            var status = user.IsDeleted ? "đã bị xoá" : "được kích hoạt lại";
            return Ok(new ApiResponse<User>(200, user, $"Người dùng {status}"));
        }


        [HttpPut("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.EmailOrPhone || u.Phone == request.EmailOrPhone);
            if (user == null) return NotFound("Người dùng không tồn tại");

            if (!_cache.TryGetValue($"OTP_{request.EmailOrPhone}", out string cachedOtp))
                return BadRequest("OTP hết hạn hoặc chưa được gửi");

            if (cachedOtp != request.Otp)
                return BadRequest("OTP không đúng");

            user.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            _cache.Remove($"OTP_{request.EmailOrPhone}");
            await _context.SaveChangesAsync();

            return Ok("Đặt lại mật khẩu thành công");
        }

        [HttpPost("send-verification-email")]
        public async Task<IActionResult> SendVerificationEmail([FromBody] SendEmailRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null) return NotFound("Người dùng không tồn tại");

            var token = Guid.NewGuid().ToString();
            user.IsDeleted = false;
            await _context.SaveChangesAsync();

            try
            {
                using var smtp = new SmtpClient("smtp.gmail.com")
                {
                    Port = 587,
                    Credentials = new NetworkCredential("sniper021003@gmail.com", "iwoj flbu lsjf kpnw"),
                    EnableSsl = true
                };

                var mail = new MailMessage
                {
                    From = new MailAddress("sniper021003@gmail.com"),
                    Subject = "Xác thực tài khoản",
                    Body = $"Click vào link để xác thực: http://localhost:3000/verify-email?token={token}&email={user.Email}",
                    IsBodyHtml = false
                };
                mail.To.Add(user.Email);
                smtp.Send(mail);
            }
            catch (Exception ex)
            {
                return BadRequest("Gửi email thất bại: " + ex.Message);
            }

            return Ok("Email xác thực đã được gửi.");
        }
        [HttpPost("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null) return NotFound("Người dùng không tồn tại");

            user.IsVerified = true;
            user.IsDeleted = false;
            await _context.SaveChangesAsync();

            return Ok("Xác thực tài khoản thành công 🎉");
        }
    }
    public class SendEmailRequest
    {
        public string Email { get; set; } = string.Empty;
    }
    public class VerifyEmailRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
    }
    public class UpdateUserRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Otp { get; set; } = string.Empty;
    }
    public class ResetPasswordRequest
    {
        public string EmailOrPhone { get; set; } = string.Empty;
        public string Otp { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
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
        public string NewPasswordRequest { get; set; }
    }
    public class SendOtpRequest
    {
        public string EmailOrPhone { get; set; } = string.Empty;
        public bool IsEmail { get; set; } = true;
    }

    public class VerifyOtpRequest
    {
        public string EmailOrPhone { get; set; } = string.Empty;
        public string Otp { get; set; } = string.Empty;
    }
}