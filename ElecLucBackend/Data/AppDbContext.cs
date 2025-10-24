using Microsoft.EntityFrameworkCore;
using Models;
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) 
        : base(options) 
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<CarCategory> CarCategories { get; set; }
    public DbSet<Car> Cars { get; set; }
    public DbSet<RentalPlan> RentalPlans { get; set; }
    public DbSet<Booking> Bookings { get; set; }
    public DbSet<Payment> Payments { get; set; }
    public DbSet<Feedback> Feedbacks { get; set; }
    public DbSet<TestDrive> TestDrives { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<Promotion> Promotions { get; set; }
    public DbSet<BookingPromotion> BookingPromotions { get; set; }
    public DbSet<CarImage> CarImages { get; set; }
    public DbSet<CarSpecification> CarSpecifications { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Booking>()
            .HasOne(b => b.Payment)
            .WithOne(p => p.Booking)
            .HasForeignKey<Payment>(p => p.BookingId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<BookingPromotion>()
            .HasKey(bp => new { bp.BookingId, bp.PromoId });

        modelBuilder.Entity<BookingPromotion>()
            .HasOne(bp => bp.Booking)
            .WithMany(b => b.BookingPromotions)
            .HasForeignKey(bp => bp.BookingId);

        modelBuilder.Entity<BookingPromotion>()
            .HasOne(bp => bp.Promotion)
            .WithMany(p => p.BookingPromotions)
            .HasForeignKey(bp => bp.PromoId);

        modelBuilder.Entity<Booking>()
            .HasOne(b => b.User)
            .WithMany(u => u.Bookings)
            .HasForeignKey(b => b.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Car>()
            .HasOne(c => c.Category)
            .WithMany(cat => cat.Cars)
            .HasForeignKey(c => c.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<RentalPlan>()
            .HasOne(rp => rp.Car)
            .WithMany(c => c.RentalPlans)
            .HasForeignKey(rp => rp.CarId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Booking>()
            .HasOne(b => b.Car)
            .WithMany(c => c.Bookings)
            .HasForeignKey(b => b.CarId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Booking>()
            .HasOne(b => b.Plan)
            .WithMany(p => p.Bookings)
            .HasForeignKey(b => b.PlanId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Feedback>()
            .HasOne(f => f.User)
            .WithMany(u => u.Feedbacks)
            .HasForeignKey(f => f.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Feedback>()
            .HasOne(f => f.Car)
            .WithMany(c => c.Feedbacks)
            .HasForeignKey(f => f.CarId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TestDrive>()
            .HasOne(t => t.User)
            .WithMany(u => u.TestDrives)
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TestDrive>()
            .HasOne(t => t.Car)
            .WithMany(c => c.TestDrives)
            .HasForeignKey(t => t.CarId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Notification>()
            .HasOne(n => n.User)
            .WithMany(u => u.Notifications)
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<CarSpecification>()
            .HasOne(s => s.Car)
            .WithMany(c => c.Specifications)
            .HasForeignKey(s => s.CarId);

        modelBuilder.Entity<CarImage>()
            .HasOne(i => i.Car)
            .WithMany(c => c.CarImages)
            .HasForeignKey(i => i.CarId);
    }
}
