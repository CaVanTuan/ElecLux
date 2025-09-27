using PuppeteerSharp;
using System;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

public class GreenFutureScraper
{
    private readonly AppDbContext _context;

    public GreenFutureScraper(AppDbContext context)
    {
        _context = context;
    }

    public async Task ScrapeCarsAsync()
    {
        // Các URL theo từng gói
        var rentalPages = new List<(string Url, string Duration)>
        {
            ("https://greenfuture.tech/thue-xe-tu-lai", "Ngày"),
            ("https://greenfuture.tech/thue-xe-tu-lai/theo-thang", "Tháng"),
            ("https://greenfuture.tech/thue-xe-tu-lai/theo-nam", "Năm")
        };

        var browserFetcher = new BrowserFetcher();
        await browserFetcher.DownloadAsync();

        using var browser = await Puppeteer.LaunchAsync(new LaunchOptions
        {
            Headless = true,
            DefaultViewport = null
        });

        using var page = await browser.NewPageAsync();

        foreach (var (url, durationType) in rentalPages)
        {
            Console.WriteLine($"🔎 Scraping {durationType} from {url}");
            await page.GoToAsync(url);
            await Task.Delay(5000);

            var cars = await page.QuerySelectorAllAsync("a.car-item");
            Console.WriteLine($"➡️ Found {cars.Length} cars on {durationType}");

            foreach (var car in cars)
            {
                try
                {
                    // Name
                    var nameHandle = await car.QuerySelectorAsync("div.text-center.font-extrabold");
                    var name = (await nameHandle?.EvaluateFunctionAsync<string>("el => el.textContent"))?.Trim();
                    if (string.IsNullOrEmpty(name)) continue;

                    // Price
                    var priceHandle = await car.QuerySelectorAsync("div.font-black");
                    var priceText = (await priceHandle?.EvaluateFunctionAsync<string>("el => el.textContent"))?.Trim() ?? "0";
                    var priceClean = priceText.Replace(".", "").Replace(",", "");
                    decimal price = decimal.TryParse(priceClean, NumberStyles.Any, CultureInfo.InvariantCulture, out var p) ? p : 0;

                    // Type
                    var typeHandle = await car.QuerySelectorAsync("img[src*='car-type'] + div");
                    var type = (await typeHandle?.EvaluateFunctionAsync<string>("el => el.textContent"))?.Trim() ?? "Unknown";

                    // Range
                    var rangeHandle = await car.QuerySelectorAsync("img[src*='range_per_charge'] + div");
                    var rangeText = (await rangeHandle?.EvaluateFunctionAsync<string>("el => el.textContent"))?.Trim() ?? "0";
                    int range = 0;
                    if (rangeText.Contains("km"))
                    {
                        var num = new string(rangeText.Where(char.IsDigit).ToArray());
                        int.TryParse(num, out range);
                    }

                    // Seats
                    var seatHandle = await car.QuerySelectorAsync("img[src*='no_of_seat'] + div");
                    var seatText = (await seatHandle?.EvaluateFunctionAsync<string>("el => el.textContent"))?.Trim() ?? "0";
                    int seats = 0;
                    if (seatText.Contains("chỗ"))
                    {
                        var num = new string(seatText.Where(char.IsDigit).ToArray());
                        int.TryParse(num, out seats);
                    }

                    // Image
                    var imgHandle = await car.QuerySelectorAsync(".car-image img");
                    var imgUrl = await imgHandle?.EvaluateFunctionAsync<string>("el => el.src");

                    // Category
                    var category = _context.CarCategories.FirstOrDefault(c => c.Name == type);
                    if (category == null)
                    {
                        category = new CarCategory
                        {
                            Name = type,
                            Description = "Không có mô tả"
                        };
                        _context.CarCategories.Add(category);
                        await _context.SaveChangesAsync();
                    }

                    // Check Car đã tồn tại chưa
                    var carEntity = _context.Cars.FirstOrDefault(c => c.Name == name && c.CategoryId == category.CategoryId);
                    if (carEntity == null)
                    {
                        carEntity = new Car
                        {
                            Name = name,
                            Type = type,
                            Seats = seats,
                            PricePerDay = price,
                            RangeKm = range,
                            ImageUrl = imgUrl,
                            Description = "",
                            CategoryId = category.CategoryId
                        };
                        _context.Cars.Add(carEntity);
                        await _context.SaveChangesAsync();
                    }

                    // Thêm RentalPlan theo duration
                    if (!_context.RentalPlans.Any(r => r.CarId == carEntity.CarId && r.DurationType == durationType))
                    {
                        var rentalPlan = new RentalPlan
                        {
                            CarId = carEntity.CarId,
                            DurationType = durationType,
                            Price = price
                        };
                        _context.RentalPlans.Add(rentalPlan);
                        await _context.SaveChangesAsync();
                    }

                    Console.WriteLine($"✅ {name} - {durationType}: {price}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error scraping car ({durationType}): {ex.Message}");
                }
            }
        }

        Console.WriteLine("Scraping completed!");
    }
}