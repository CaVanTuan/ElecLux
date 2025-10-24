using PuppeteerSharp;
using System;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using Models;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace Scraper
{
    public class GreenFutureScraper
    {
        private readonly AppDbContext _context;

        public GreenFutureScraper(AppDbContext context)
        {
            _context = context;
        }

        public async Task ScrapeCarsAsync()
        {
            var rentalPages = new List<(string Url, string Duration)>
            {
                ("https://greenfuture.tech/thue-xe-tu-lai", "Ngày"),
                ("https://greenfuture.tech/thue-xe-tu-lai/theo-thang", "Tháng"),
                ("https://greenfuture.tech/thue-xe-tu-lai/theo-nam", "Năm")
            };

            Console.WriteLine("Setting up browser...");
            var browserFetcher = new BrowserFetcher();
            await browserFetcher.DownloadAsync();

            using var browser = await Puppeteer.LaunchAsync(new LaunchOptions { Headless = true });
            using var page = await browser.NewPageAsync();

            foreach (var (url, durationType) in rentalPages)
            {
                Console.WriteLine($"🔎 Scraping rental plan '{durationType}' from {url}");
                await page.GoToAsync(url);
                await page.WaitForSelectorAsync("a.car-item");

                var carElements = await page.QuerySelectorAllAsync("a.car-item");
                Console.WriteLine($"➡️ Found {carElements.Length} cars for '{durationType}' plan.");

                foreach (var carElement in carElements)
                {
                    string carName = "";
                    try
                    {
                        var carLink = await carElement.EvaluateFunctionAsync<string>("el => el.href");
                        carName = await carElement.EvaluateFunctionAsync<string>("el => el.querySelector('div.text-center.font-extrabold')?.textContent.trim()");

                        if (string.IsNullOrEmpty(carLink) || string.IsNullOrEmpty(carName)) continue;

                        var carEntity = await _context.Cars
                            .Include(c => c.CarImages)
                            .Include(c => c.Specifications)
                            .AsSplitQuery() 
                            .FirstOrDefaultAsync(c => c.Name == carName);

                        if (carEntity == null)
                        {
                            carEntity = new Car { Name = carName };
                            using var detailPage = await browser.NewPageAsync();
                            await detailPage.GoToAsync(carLink);
                            await detailPage.WaitForSelectorAsync("div.c-detail-box");

                            Console.WriteLine($"\tNew car found: '{carName}'. Scraping details...");

                            carEntity.ImageUrl = await detailPage.EvaluateFunctionAsync<string>("() => document.querySelector('.embla__slide img')?.src");

                            var descHandle = await detailPage.QuerySelectorAsync("div.car-description");
                            carEntity.Description = descHandle != null ? await descHandle.EvaluateFunctionAsync<string>("el => el.textContent.trim()") : "Không có mô tả";

                            var imageUrls = await detailPage.EvaluateFunctionAsync<string[]>("() => Array.from(document.querySelectorAll('.embla__container .embla__slide img')).map(img => img.src)");
                            if (imageUrls != null)
                            {
                                foreach (var imageUrl in imageUrls)
                                {
                                    carEntity.CarImages.Add(new CarImage { Url = imageUrl });
                                }
                            }

                            var specItems = await detailPage.QuerySelectorAllAsync(".c-detail-box__right .c-utility-item");
                            if (specItems != null)
                            {
                                foreach (var item in specItems)
                                {
                                    var iconClass = await item.EvaluateFunctionAsync<string>("el => el.querySelector('i')?.className");
                                    var value = await item.EvaluateFunctionAsync<string>("el => el.querySelector('.c-utility-item__content')?.textContent.trim()");
                                    
                                    string key = "";
                                    if (iconClass != null)
                                    {
                                        key = iconClass switch
                                        {
                                            "icon16-detail-no_of_seat" => "Số chỗ",
                                            "icon16-detail-range_per_charge" => "Quãng đường",
                                            "icon16-detail-transmission" => "Hộp số",
                                            "icon16-detail-airbag" => "Túi khí",
                                            "icon16-detail-max_power" => "Công suất",
                                            "icon16-detail-car_model" => "Loại xe",
                                            "icon16-detail-trunk_capacity" => "Dung tích cốp",
                                            _ => ""
                                        };
                                    }

                                    if (!string.IsNullOrEmpty(key) && !string.IsNullOrEmpty(value))
                                    {
                                        if (!carEntity.Specifications.Any(s => s.Key == key))
                                        {
                                            carEntity.Specifications.Add(new CarSpecification { Key = key, Value = value });
                                        }

                                        if (key == "Số chỗ")
                                        {
                                            var match = Regex.Match(value, @"\d+");
                                            if (match.Success)
                                            {
                                                int.TryParse(match.Value, out int seatsValue);
                                                carEntity.Seats = seatsValue;
                                            }
                                        }
                                        if (key == "Quãng đường")
                                        {
                                            var matches = Regex.Matches(value, @"\d+");
                                            
                                            var numbers = matches.Cast<Match>()
                                                                .Select(m => int.TryParse(m.Value, out var num) ? num : 0)
                                                                .Where(num => num > 0)
                                                                .ToList();

                                            carEntity.RangeKm = numbers.Any() ? numbers.Max() : 0;
                                        }
                                        if (key == "Loại xe")
                                        {
                                            carEntity.Type = value;
                                        }
                                    }
                                }
                            }
                            var categoryName = carEntity.Type ?? "Unknown";
                            var category = await _context.CarCategories.FirstOrDefaultAsync(c => c.Name == categoryName);
                            if (category == null)
                            {
                                category = new CarCategory { Name = categoryName, Description = "Chưa có mô tả" };
                                _context.CarCategories.Add(category);
                            }
                            carEntity.Category = category;

                            _context.Cars.Add(carEntity);
                            await _context.SaveChangesAsync();
                        }

                        var priceText = await carElement.EvaluateFunctionAsync<string>("el => el.querySelector('div.font-black')?.textContent.trim()") ?? "0";
                        var priceClean = new string(priceText.Where(char.IsDigit).ToArray());
                        decimal.TryParse(priceClean, out var price);

                        var planExists = await _context.RentalPlans.AnyAsync(r => r.CarId == carEntity.CarId && r.DurationType == durationType);
                        if (!planExists)
                        {
                            _context.RentalPlans.Add(new RentalPlan
                            {
                                CarId = carEntity.CarId,
                                DurationType = durationType,
                                Price = price
                            });
                            Console.WriteLine($"\tAdded plan '{durationType}' for '{carName}' with price {price:N0} VNĐ");
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"\tError processing car '{carName}': {ex.Message}");
                    }
                }
                
                await _context.SaveChangesAsync();
                Console.WriteLine($"Data for rental plan '{durationType}' saved successfully.");
            }

            Console.WriteLine("Scraping completed for all rental plans!");
        }
    }
}