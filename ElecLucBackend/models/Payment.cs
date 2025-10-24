using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace Models
{
    [Table("Payments")]
    public class Payment
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int PaymentId { get; set; }

        [ForeignKey("Booking")]
        public int BookingId { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [Required, MaxLength(50)]
        public string Method { get; set; } // Momo, ZaloPay, Stripe...

        [MaxLength(50)]
        public string Status { get; set; } // Trạng thái thanh toán

        public DateTime PaymentDate { get; set; }

        public Booking Booking { get; set; }
    }
}