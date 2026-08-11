using Microsoft.EntityFrameworkCore;

namespace MfItm.Host.Api.Data;

/// <summary>
/// Identity and access for the shell: users, the organizations they belong to,
/// and the permissions they hold in each.
/// </summary>
public sealed class HostDbContext(DbContextOptions<HostDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Organization> Organizations => Set<Organization>();
    public DbSet<Membership> Memberships => Set<Membership>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(user => user.Id);
            entity.Property(user => user.Id).HasMaxLength(64);
            entity.Property(user => user.Name).HasMaxLength(200).IsRequired();
            entity.Property(user => user.Email).HasMaxLength(320).IsRequired();
            // Sign-in looks users up by email, and two accounts sharing one is a
            // data bug rather than something to resolve at query time.
            entity.HasIndex(user => user.Email).IsUnique();
        });

        modelBuilder.Entity<Organization>(entity =>
        {
            entity.HasKey(organization => organization.Id);
            entity.Property(organization => organization.Id).HasMaxLength(64);
            entity.Property(organization => organization.Name).HasMaxLength(200).IsRequired();
        });

        modelBuilder.Entity<Membership>(entity =>
        {
            // A user has at most one membership per organization; the pair is the
            // natural key, so there is no surrogate id to keep unique separately.
            entity.HasKey(membership => new { membership.UserId, membership.OrganizationId });

            entity.HasOne(membership => membership.User)
                .WithMany(user => user.Memberships)
                .HasForeignKey(membership => membership.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(membership => membership.Organization)
                .WithMany(organization => organization.Memberships)
                .HasForeignKey(membership => membership.OrganizationId)
                .OnDelete(DeleteBehavior.Cascade);

            // Permissions are a text[] column rather than a join table: they are
            // read as a whole set on every request and never queried individually,
            // so a table here would add a join for no benefit.
            entity.Property(membership => membership.Permissions)
                .HasColumnType("text[]")
                .IsRequired();
        });
    }
}

public sealed class User
{
    public required string Id { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public List<Membership> Memberships { get; set; } = [];
}

public sealed class Organization
{
    public required string Id { get; set; }
    public required string Name { get; set; }
    public List<Membership> Memberships { get; set; } = [];
}

/// <summary>A user's access WITHIN one organization. Permissions are per-org, not global.</summary>
public sealed class Membership
{
    public required string UserId { get; set; }
    public required string OrganizationId { get; set; }
    public required string[] Permissions { get; set; }

    /// <summary>
    /// The organization the shell opens in when the request names none. Modelled
    /// explicitly rather than inferred from row order or name, both of which pick
    /// an arbitrary org and can change between requests.
    /// </summary>
    public bool IsDefault { get; set; }

    public User? User { get; set; }
    public Organization? Organization { get; set; }
}
