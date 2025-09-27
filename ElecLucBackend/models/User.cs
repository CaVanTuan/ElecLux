using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

public class User
{
    [Key]
    public int UserId { get; set; }

    [Required, MaxLength(100)]
    public string Name { get; set; }

    [Required, MaxLength(100), EmailAddress]
    public string Email { get; set; }

    [Required, MaxLength(200)]
    public string Password { get; set; }

    [Required, MaxLength(20)]
    public string Role { get; set; }

    [MaxLength(20)]
    public string Phone { get; set; }

    [MaxLength(200)]
    public string Address { get; set; }

    // Navigation properties
    public ICollection<Booking> Bookings { get; set; }
    public ICollection<Feedback> Feedbacks { get; set; }
    public ICollection<TestDrive> TestDrives { get; set; }
    public ICollection<Notification> Notifications { get; set; }
}