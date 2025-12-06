using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Models;
using System.Security.Claims;

namespace Controllers
{
    [ApiController]
    [Route("api/cars")]
    public class CarController : ControllerBase
    {
        private readonly AppDbContext _context;
        public CarController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateCar
        ([FromBody] CreateCarRequest request)
        {
            if (await _context.Cars.AnyAsync(c => c.Name == request.Name))
                return BadRequest("Xe đã tồn tại.");
            var car = new Car
            {
                Name = request.Name,
                Description = request.Description,
                Type = request.Type,
                Seats = request.Seats,
                RangeKm = request.RangeKm,
                ImageUrl = request.ImageUrl,
                CategoryId = request.CategoryId,
            };
            _context.Cars.Add(car);
            await _context.SaveChangesAsync();
            if (request.Specification != null && request.Specification.Any())
            {
                var spe = request.Specification.Select(c => new CarSpecification
                {
                    CarId = car.CarId,
                    Key = c.Key,
                    Value = c.Value
                }).ToList();
                _context.CarSpecifications.AddRange(spe);
            }
            if (request.Images != null && request.Images.Any())
            {
                var img = request.Images.Select(c => new CarImage
                {
                    CarId = car.CarId,
                    Url = c.Url
                }).ToList();
                _context.CarImages.AddRange(img);
            }
            await _context.SaveChangesAsync();
            return Ok(car);
        }
        [HttpGet("get-by-carCategoryName")]
        public async Task<IActionResult> GetCarByCarCategoryName(string carCategoryName)
        {
            var listOfCarCategories = await _context.CarCategories.FirstOrDefaultAsync(c => c.Name == carCategoryName);
            if (listOfCarCategories == null) return NotFound("Không tìm thấy danh mục");
            var listOfCars = await _context.Cars
            .Where(c => c.CategoryId == listOfCarCategories.CategoryId)
            .Include(c => c.Category)
            .Include(c => c.RentalPlans)
            .Include(c => c.Specifications)
            .Include(c => c.CarImages)
            .ToListAsync();
            return Ok(listOfCars);
        }

        [HttpGet("{carId}")]
        public async Task<IActionResult> GetCarById(int carId)
        {
            var car = await _context.Cars
            .Include(c => c.Category)
            .Include(c => c.RentalPlans)
            .Include(c => c.Specifications)
            .Include(c => c.CarImages)
            .FirstOrDefaultAsync(c => c.CarId == carId);
            if (car == null) return NotFound("Không tìm thấy xe");
            return Ok(car);
        }

        [HttpGet("All")]
        public async Task<IActionResult> GetAllCar()
        {
            var listOfCar = await _context.Cars
            .Include(c => c.Category)
            .Include(c => c.RentalPlans)
            .Include(c => c.Specifications)
            .Include(c => c.CarImages)
            .ToListAsync();
            return Ok(listOfCar);
        }

        [HttpGet("get-by-rentalPlan")]
        public async Task<IActionResult> GetCarByRentalPlan(string durationType)
        {
            var carIds = await _context.RentalPlans
                .Where(r => r.DurationType == durationType)
                .Select(r => r.CarId)
                .ToListAsync();

            var cars = await _context.Cars
                .Where(c => carIds.Contains(c.CarId))
                .Include(c => c.Category)
                .Include(c => c.RentalPlans)
                .Include(c => c.Specifications)
                .Include(c => c.CarImages)
                .ToListAsync();

            return Ok(cars);
        }

        [HttpPut("{carId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateCarById
        (int carId, [FromBody] CreateCarRequest request)
        {
            var car = await _context.Cars
            .Include(c => c.Specifications)
            .Include(c => c.CarImages)
            .FirstOrDefaultAsync(c => c.CarId == carId);
            if (car == null) return NotFound("Không tìm thấy xe");
            car.Name = request.Name;
            car.Type = request.Type;
            car.Description = request.Description;
            car.Seats = request.Seats;
            car.RangeKm = request.RangeKm;
            car.ImageUrl = request.ImageUrl;
            car.CategoryId = request.CategoryId;

            if (request.Specification != null && request.Specification.Any())
            {
                _context.CarSpecifications.RemoveRange(car.Specifications);
                var spe = request.Specification.Select(c => new CarSpecification
                {
                    CarId = carId,
                    Key = c.Key,
                    Value = c.Value
                }).ToList();
                _context.CarSpecifications.AddRange(spe);
            }
            if (request.Images != null && request.Images.Any())
            {
                _context.CarImages.RemoveRange(car.CarImages);
                var img = request.Images.Select(c => new CarImage
                {
                    CarId = car.CarId,
                    Url = c.Url
                }).ToList();
                _context.CarImages.AddRange(img);
            }
            _context.Cars.Update(car);
            await _context.SaveChangesAsync();
            return Ok("Chỉnh sửa thông tin xe thành công");
        }
        [HttpDelete("{carId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCar(int carId)
        {
            var car = await _context.Cars.FirstOrDefaultAsync(c => c.CarId == carId);
            if (car == null) return NotFound("Xe không tồn tại");

            _context.Cars.Remove(car);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Xóa thành công"
            });
        }
    }
    public class CreateCarRequest
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string Type { get; set; }
        public int Seats { get; set; }
        public int RangeKm { get; set; }
        public string ImageUrl { get; set; }
        public int CategoryId { get; set; }

        public List<CreateSpecificationRequest> Specification { get; set; } = new List<CreateSpecificationRequest>();
        public List<CreateImageRequest> Images { get; set; } = new List<CreateImageRequest>();
    }
    public class CreateSpecificationRequest
    {
        public string Key { get; set; }
        public string Value { get; set; }
    }
    public class CreateImageRequest
    {
        public string Url { get; set; }
    }
}