using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Models;

namespace Controllers
{
    [ApiController]
    [Route("api/rentalPlans")]
    public class RentalPlanController : ControllerBase
    {
        private readonly AppDbContext _context;
        public RentalPlanController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("{carId}")]
        [Authorize]
        public async Task<IActionResult> CreateRentalPlan(int carId, [FromBody] CreateRentalPlanRequest request)
        {
            var car = await _context.Cars.FirstOrDefaultAsync(c => c.CarId == carId);
            if (car == null) return NotFound("Xe không tồn tại");
            if (await _context.RentalPlans.AnyAsync(c => c.CarId == carId && c.DurationType == request.DurationType && c.Price == request.Price))
                return BadRequest("Gói này đã tồn tại trên xe này");
            var rentalPlan = new RentalPlan
            {
                DurationType = request.DurationType,
                Price = request.Price,
                CarId = carId
            };
            _context.RentalPlans.Add(rentalPlan);
            await _context.SaveChangesAsync();
            return Ok(rentalPlan);
        }

        [HttpGet("All")]
        public async Task<IActionResult> GetAllRentalPlan()
        {
            var listOfRentalPlan = await _context.RentalPlans
            .Include(c => c.Car)
            .ToListAsync();
            return Ok(listOfRentalPlan);
        }

        [HttpGet("{carId}")]
        public async Task<IActionResult> GetRentalPlanByCarId(int carId)
        {
            var listOfRentalPlan = await _context.RentalPlans
            .Where(c => c.CarId == carId)
            .Include(c => c.Car)
            .ToListAsync();

            if (listOfRentalPlan.Count == 0) return NotFound("Không tìm thấy gói thuê nào");
            return Ok(listOfRentalPlan);
        }

        [HttpGet("carName")]
        public async Task<IActionResult> GetRentalPlanByCarName(string carName)
        {
            var listOfRentalPlan = await _context.RentalPlans
            .Where(c => c.Car.Name == carName)
            .Include(c => c.Car)
            .ToListAsync();
            if (listOfRentalPlan.Count == 0) return NotFound("Không tìm thấy gói thuê nào.");
            return Ok(listOfRentalPlan);
        }

        [HttpGet("durationType")]
        public async Task<IActionResult> GetRentalPlanByName(string durationType)
        {
            var listOfRentalPlan = await _context.RentalPlans
            .Where(c => c.DurationType == durationType)
            .Include(c => c.Car)
            .ToListAsync();
            if (listOfRentalPlan.Count == 0) return NotFound("Không tìm thấy gói thuê nào.");
            return Ok(listOfRentalPlan);
        }

        [HttpPut("{rentalPlanId}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> UpdateRentalPlan(int rentalPlanId, [FromBody] CreateRentalPlanRequest request)
        {
            var rentalPlan = await _context.RentalPlans.FirstOrDefaultAsync(c => c.PlanId == rentalPlanId);
            if (rentalPlan == null) return NotFound("Không tìm thấy gói thuê.");
            rentalPlan.DurationType = request.DurationType;
            rentalPlan.Price = request.Price;
            _context.Update(rentalPlan);
            await _context.SaveChangesAsync();
            return Ok(rentalPlan);
        }

        [HttpDelete("{rentalPlanId}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteRentalPlan(int rentalPlanId)
        {
            var rentalPlan = await _context.RentalPlans.FirstOrDefaultAsync(c => c.PlanId == rentalPlanId);
            if (rentalPlan == null) return NotFound("Không tìm thấy gói thuê.");
            _context.RentalPlans.Remove(rentalPlan);
            await _context.SaveChangesAsync();
            return Ok("Đã xóa thành công gói thuê");
        }
    }
    public class CreateRentalPlanRequest
    {
        public string DurationType { get; set; }
        public decimal Price { get; set; }
    }
}