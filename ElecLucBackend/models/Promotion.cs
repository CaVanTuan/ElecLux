using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;
public class Promotion
{
    [Key]
    public int PromoId { get; set; }

    [Required, MaxLength(50)]
    public string Code { get; set; }

    [MaxLength(500)]
    public string Description { get; set; }

    [Range(0, 100)]
    public double DiscountPercent { get; set; }

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    [MaxLength(20)]
    public string Status { get; set; } // còn hạn / hết hạn
    public ICollection<BookingPromotion> BookingPromotions { get; set; }

}
