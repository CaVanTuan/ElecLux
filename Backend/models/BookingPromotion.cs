using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace Models
{
    [Table("BookingPromotions")]
    public class BookingPromotion
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int BookingPromotionId { get; set; }
        
        [ForeignKey("Booking")]
        public int BookingId { get; set; }
        public Booking Booking { get; set; }

        [ForeignKey("Promotion")]
        public int PromoId { get; set; }
        public Promotion Promotion { get; set; }
    }
}