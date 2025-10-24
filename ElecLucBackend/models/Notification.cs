using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace Models
{
    [Table("Notifications")]
    public class Notification
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int NotificationId { get; set; }

        [ForeignKey("User")]
        public int UserId { get; set; }

        [Required, MaxLength(50)]
        public string Type { get; set; } // booking, payment, promotion...

        [Required, MaxLength(500)]
        public string Message { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } // đã đọc / chưa đọc

        public DateTime CreatedAt { get; set; }

        public User User { get; set; }
    }
}