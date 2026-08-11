using Microsoft.EntityFrameworkCore;

namespace MfItm.Em.Api.Data;

/// <summary>Employee Management: the worker roster the EM remote renders.</summary>
public sealed class EmDbContext(DbContextOptions<EmDbContext> options) : DbContext(options)
{
    public DbSet<Worker> Workers => Set<Worker>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Worker>(entity =>
        {
            entity.HasKey(worker => worker.Id);
            entity.Property(worker => worker.Id).HasMaxLength(64);
            entity.Property(worker => worker.Name).HasMaxLength(200).IsRequired();
            entity.Property(worker => worker.Email).HasMaxLength(320).IsRequired();
            entity.Property(worker => worker.Phone).HasMaxLength(40).IsRequired();
            entity.Property(worker => worker.EmployeeId).HasMaxLength(40).IsRequired();
            entity.Property(worker => worker.Role).HasMaxLength(100).IsRequired();
            entity.Property(worker => worker.Site).HasMaxLength(100).IsRequired();

            // Stored as text, not an int enum: the values are read directly in the
            // database and survive reordering of the C# enum.
            entity.Property(worker => worker.Status)
                .HasConversion<string>()
                .HasMaxLength(20)
                .IsRequired();

            entity.Property(worker => worker.Compliance)
                .HasConversion<string>()
                .HasMaxLength(20)
                .IsRequired();

            // The roster is scoped per organization and every query filters by it,
            // so it leads the composite index. Name is the default sort.
            entity.HasIndex(worker => new { worker.OrganizationId, worker.Name });
            entity.Property(worker => worker.OrganizationId).HasMaxLength(64).IsRequired();

            // A DATE, not a timestamp — the UI renders "MMM DD, YYYY" and a time
            // component would only introduce timezone ambiguity.
            entity.Property(worker => worker.LastActive).HasColumnType("date");
        });
    }
}

public enum WorkerStatus
{
    Active,
    Pending,
    Inactive,
}

public enum ComplianceStatus
{
    Compliant,
    Expiring,
    Expired,
}

public sealed class Worker
{
    public required string Id { get; set; }
    public required string OrganizationId { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public required string Phone { get; set; }
    public required string EmployeeId { get; set; }
    public required WorkerStatus Status { get; set; }
    public required ComplianceStatus Compliance { get; set; }
    public required string Role { get; set; }
    public required string Site { get; set; }

    /// <summary>Training completion, 0-100.</summary>
    public required int Training { get; set; }

    public required DateOnly LastActive { get; set; }
}
