using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;
public class Car
{
    [Key]
    public int CarId { get; set; }

    [ForeignKey("CarCategory")]
    public int CategoryId { get; set; }

    [Required, MaxLength(100)]
    public string Name { get; set; }

    [MaxLength(50)]
    public string Type { get; set; }

    [Range(1, 100)]
    public int Seats { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal PricePerDay { get; set; }

    public int RangeKm { get; set; }

    [MaxLength(300)]
    public string ImageUrl { get; set; }

    [MaxLength(500)]
    public string Description { get; set; }

    public CarCategory Category { get; set; }
    public ICollection<RentalPlan> RentalPlans { get; set; }
    public ICollection<Booking> Bookings { get; set; }
    public ICollection<Feedback> Feedbacks { get; set; }
    public ICollection<TestDrive> TestDrives { get; set; }
}
