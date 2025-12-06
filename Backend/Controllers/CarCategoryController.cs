using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace Controllers
{
    [ApiController]
    [Route("api/carCategories")]
    public class CarCategoryController : ControllerBase
    {
        private readonly AppDbContext _context;
        public CarCategoryController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> CreateCarCategory([FromBody] CarCategoryRequest request)
        {
            if (await _context.CarCategories.AnyAsync(c => c.Name == request.Name)) return BadRequest("Danh mục đã tồn tại");
            var carCategory = new CarCategory
            {
                Name = request.Name,
                Description = request.Description
            };
            _context.CarCategories.Add(carCategory);
            await _context.SaveChangesAsync();
            return Ok(carCategory);
        }

        [HttpGet("All")]
        public async Task<IActionResult> GetAllCategory()
        {
            var categories = await _context.CarCategories
                .Include(c => c.Cars)
                    .ThenInclude(car => car.CarImages)
                .ToListAsync();
            return Ok(categories);
        }

        [HttpGet("{CarCategoryId}")]
        public async Task<IActionResult> GetCarCategoryById(int carCategoryId)
        {
            var carCategory = await _context.CarCategories.FirstOrDefaultAsync(c => c.CategoryId == carCategoryId);
            if (carCategory == null) return NotFound("Danh mục không tồn tại");
            return Ok(carCategory);
        }

        [HttpGet("carCategoryName")]
        public async Task<IActionResult> GetCarCategoryByName(string carCategoryName)
        {
            var carCategory = await _context.CarCategories.FirstOrDefaultAsync(c => c.Name == carCategoryName);
            if (carCategory == null) return NotFound("Danh mục không tồn tại");
            return Ok(carCategory);
        }

        [HttpPut("{carCategoryId}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> UpdateCarCategory(int carCategoryId, [FromBody] CarCategoryRequest request)
        {
            var carCategory = await _context.CarCategories.FirstOrDefaultAsync(c => c.CategoryId == carCategoryId);
            if (carCategory == null) return NotFound("Không tìm thấy danh mục");
            carCategory.Name = request.Name;
            carCategory.Description = request.Description;
            _context.CarCategories.Update(carCategory);
            await _context.SaveChangesAsync();
            return Ok("Sửa danh mục thành công");
        }

        [HttpDelete("{carCategoryId}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteCarCategory(int carCategoryId)
        {
            var carCategory = await _context.CarCategories.FirstOrDefaultAsync(c => c.CategoryId == carCategoryId);
            if (carCategory == null) return NotFound("Danh mục không tồn tại");
            _context.CarCategories.Remove(carCategory);
            await _context.SaveChangesAsync();
            return Ok("Xóa thành công");
        }
    }
    public class CarCategoryRequest
    {
        public string Name { get; set;}
        public string Description { get; set; }
    }
}