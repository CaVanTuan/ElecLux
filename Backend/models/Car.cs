using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace Models{
    [Table("Cars")]
    public class Car
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CarId { get; set; }

        [ForeignKey("CarCategory")]
        public int CategoryId { get; set; }

        [Required, MaxLength(100)]
        public string Name { get; set; }

        [MaxLength(50)]
        public string Type { get; set; }

        [Range(1, 100)]
        public int Seats { get; set; }

        public int RangeKm { get; set; }

        [MaxLength(300)]
        public string ImageUrl { get; set; }

        [MaxLength(500)]
        public string Description { get; set; }

        public CarCategory Category { get; set; }
        public ICollection<RentalPlan> RentalPlans { get; set; } = new List<RentalPlan>();
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
        public ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();
        public ICollection<CarImage> CarImages { get; set; } = new List<CarImage>();
        public ICollection<CarSpecification> Specifications { get; set; } = new List<CarSpecification>();
    }
}
