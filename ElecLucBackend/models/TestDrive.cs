using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;
public class TestDrive
{
    [Key]
    public int TestDriveId { get; set; }

    [ForeignKey("User")]
    public int UserId { get; set; }

    [ForeignKey("Car")]
    public int CarId { get; set; }

    public DateTime Date { get; set; }

    [MaxLength(50)]
    public string Status { get; set; } // chờ xác nhận / đã duyệt / hoàn thành

    public User User { get; set; }
    public Car Car { get; set; }
}
