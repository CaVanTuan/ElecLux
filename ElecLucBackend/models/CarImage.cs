using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Models
{
    [Table("CarImages")]
    public class CarImage
    {
        [Key]
        public int ImageId { get; set; }

        [Required, MaxLength(300)]
        public string Url { get; set; }

        [ForeignKey("Car")]
        public int CarId { get; set; }
        public Car Car { get; set; }
    }
}