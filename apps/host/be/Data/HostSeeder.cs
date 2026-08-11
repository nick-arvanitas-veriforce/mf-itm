using Microsoft.EntityFrameworkCore;
using MfItm.Host.Api.Domain;

namespace MfItm.Host.Api.Data;

/// <summary>
/// Demo users and organizations. The three users differ in what they may see, so
/// the permission-driven nav is visible in the running app rather than only in
/// tests — sign in as each and the sidebar changes.
/// </summary>
public static class HostSeeder
{
    public const string DemoUserEmail = "priya.raghunathan@example.com";

    public static async Task SeedAsync(HostDbContext db, CancellationToken cancellationToken = default)
    {
        // Seeding is idempotent so it can run on every boot: Render restarts
        // containers freely, and a second run must not duplicate or overwrite.
        if (await db.Users.AnyAsync(cancellationToken))
        {
            return;
        }

        var northwind = new Organization { Id = "org-northwind", Name = "Northwind Industrial" };
        var cascade = new Organization { Id = "org-cascade", Name = "Cascade Energy" };
        var meridian = new Organization { Id = "org-meridian", Name = "Meridian Utilities" };
        db.Organizations.AddRange(northwind, cascade, meridian);

        // Full access — sees every destination.
        var priya = new User
        {
            Id = "u-priya",
            Name = "Priya Raghunathan",
            Email = DemoUserEmail,
        };

        // Training-only — no Employee Management, no Compliance, no Reports.
        var marcus = new User
        {
            Id = "u-marcus",
            Name = "Marcus Adeyemi",
            Email = "marcus.adeyemi@example.com",
        };

        // Sees Reports but NOT the Quarterly child, exercising nested filtering.
        var sofia = new User
        {
            Id = "u-sofia",
            Name = "Sofia Marchetti",
            Email = "sofia.marchetti@example.com",
        };

        db.Users.AddRange(priya, marcus, sofia);

        string[] allPermissions =
        [
            Permissions.EmployeeManagementView,
            Permissions.DigitalTrainingView,
            Permissions.ComplianceView,
            Permissions.ReportsView,
            Permissions.ReportsViewQuarterly,
            Permissions.SettingsView,
        ];

        db.Memberships.AddRange(
            // Priya belongs to all three orgs — the AppBar org picker needs more
            // than one to be worth rendering. Northwind is her default, matching
            // the organization the EM roster and DTD catalog are seeded under.
            new Membership { UserId = priya.Id, OrganizationId = northwind.Id, Permissions = allPermissions, IsDefault = true },
            new Membership { UserId = priya.Id, OrganizationId = cascade.Id, Permissions = allPermissions },
            new Membership { UserId = priya.Id, OrganizationId = meridian.Id, Permissions = allPermissions },

            new Membership
            {
                UserId = marcus.Id,
                OrganizationId = northwind.Id,
                Permissions = [Permissions.DigitalTrainingView, Permissions.SettingsView],
                IsDefault = true,
            },

            new Membership
            {
                UserId = sofia.Id,
                OrganizationId = northwind.Id,
                IsDefault = true,
                Permissions =
                [
                    Permissions.EmployeeManagementView,
                    Permissions.ComplianceView,
                    Permissions.ReportsView,
                    Permissions.SettingsView,
                ],
            });

        await db.SaveChangesAsync(cancellationToken);
    }
}
