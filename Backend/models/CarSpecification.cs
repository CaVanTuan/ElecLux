using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Models
{
    [Table("CarSpecifications")]
    public class CarSpecification
    {
        [Key]
        public int SpecId { get; set; }

        [Required, MaxLength(100)]
        public string Key { get; set; } // Ví dụ: "Hộp số", "Công suất"

        [Required, MaxLength(100)]
        public string Value { get; set; } // Ví dụ: "Số tự động", "43 HP"

        [ForeignKey("Car")]
        public int CarId { get; set; }
        public Car Car { get; set; }
    }
}