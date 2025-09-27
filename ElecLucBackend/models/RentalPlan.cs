using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

public class RentalPlan
{
    [Key]
    public int PlanId { get; set; }

    [ForeignKey("Car")]
    public int CarId { get; set; }

    [Required, MaxLength(20)]
    public string DurationType { get; set; } // Ngày/tuần/tháng

    [Column(TypeName = "decimal(18,2)")]
    public decimal Price { get; set; }

    public Car Car { get; set; }
    public ICollection<Booking> Bookings { get; set; }
}
