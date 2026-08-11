using Microsoft.EntityFrameworkCore;

namespace MfItm.Dtd.Api.Data;

/// <summary>
/// Digital Training Delivery: the course catalog.
/// <para>
/// The DTD remote is still a placeholder screen, so this schema is deliberately
/// small — enough to render a real catalog and prove the path to Neon, without
/// inventing a domain model the UI has not asked for yet.
/// </para>
/// </summary>
public sealed class DtdDbContext(DbContextOptions<DtdDbContext> options) : DbContext(options)
{
    public DbSet<Course> Courses => Set<Course>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Course>(entity =>
        {
            entity.HasKey(course => course.Id);
            entity.Property(course => course.Id).HasMaxLength(64);
            entity.Property(course => course.OrganizationId).HasMaxLength(64).IsRequired();
            entity.Property(course => course.Title).HasMaxLength(200).IsRequired();
            entity.Property(course => course.Description).HasMaxLength(1000).IsRequired();
            entity.Property(course => course.Category).HasMaxLength(100).IsRequired();

            entity.HasIndex(course => new { course.OrganizationId, course.Title });
        });
    }
}

public sealed class Course
{
    public required string Id { get; set; }
    public required string OrganizationId { get; set; }
    public required string Title { get; set; }
    public required string Description { get; set; }
    public required string Category { get; set; }

    /// <summary>Nominal length in minutes, shown on the catalog card.</summary>
    public required int DurationMinutes { get; set; }

    /// <summary>Workers currently assigned this course.</summary>
    public required int AssignedCount { get; set; }

    /// <summary>Of those assigned, how many have finished. Never exceeds <see cref="AssignedCount"/>.</summary>
    public required int CompletedCount { get; set; }

    public required bool IsPublished { get; set; }
}
