using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Models
{
    public enum PromotionStatus
    {
        Active,   // Còn hạn
        Expired   // Hết hạn
    }

    [Table("Promotions")]
    public class Promotion
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int PromoId { get; set; }

        [Required, MaxLength(50)]
        public string Code { get; set; }

        [MaxLength(500)]
        public string Description { get; set; }

        [Required]
        [Range(0, 100)]
        public double DiscountPercent { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required]
        public PromotionStatus Status { get; set; } = PromotionStatus.Active;

        public ICollection<BookingPromotion> BookingPromotions { get; set; } = new List<BookingPromotion>();
    }
}