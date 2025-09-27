using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

public class BookingPromotion
{
    [ForeignKey("Booking")]
    public int BookingId { get; set; }
    public Booking Booking { get; set; }

    [ForeignKey("Promotion")]
    public int PromoId { get; set; }
    public Promotion Promotion { get; set; }
}
