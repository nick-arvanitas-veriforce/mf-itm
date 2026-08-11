using Microsoft.EntityFrameworkCore;

namespace MfItm.Dtd.Api.Data;

/// <summary>
/// Demo course catalog. Courses match the trades in the EM roster (welding,
/// rigging, confined space) so the two services read as one product rather than
/// two unrelated demos.
/// </summary>
public static class DtdSeeder
{
    /// <summary>Matches the host BE's <c>org-northwind</c> and the EM roster's org.</summary>
    public const string DemoOrganizationId = "org-northwind";

    public static async Task SeedAsync(DtdDbContext db, CancellationToken cancellationToken = default)
    {
        if (await db.Courses.AnyAsync(cancellationToken))
        {
            return;
        }

        db.Courses.AddRange(
            New("c-101", "Confined Space Entry", "Hazard assessment, atmospheric testing, and rescue procedures for permit-required confined spaces.", "Safety", 90, 128, 104, true),
            New("c-102", "Fall Protection Awareness", "Harness inspection, anchor point selection, and tie-off procedures for work at height.", "Safety", 60, 156, 141, true),
            New("c-103", "Hot Work & Welding Permits", "Fire watch duties, permit issuance, and spark containment for cutting and welding.", "Safety", 75, 64, 38, true),
            New("c-104", "Rigging & Load Handling", "Sling selection, load charts, and hand signals for crane-assisted lifts.", "Operations", 120, 47, 29, true),
            New("c-105", "Lockout / Tagout (LOTO)", "Energy isolation, verification, and group lockout for maintenance activities.", "Safety", 45, 203, 187, true),
            New("c-106", "Respiratory Protection Fit Testing", "Selection, fit testing, and maintenance of half- and full-face respirators.", "Health", 30, 98, 71, true),
            New("c-107", "Electrical Safe Work Practices", "Arc flash boundaries, PPE categories, and NFPA 70E compliance for qualified workers.", "Safety", 105, 52, 24, true),
            New("c-108", "Incident Reporting & Root Cause", "Near-miss capture, evidence preservation, and the five-why investigation method.", "Compliance", 40, 174, 130, true),
            // Unpublished — the catalog UI needs a draft to render its non-published state.
            New("c-109", "Contractor Orientation 2027", "Updated site access, badging, and general safety orientation for the 2027 cycle.", "Onboarding", 50, 0, 0, false));

        await db.SaveChangesAsync(cancellationToken);
    }

    private static Course New(
        string id,
        string title,
        string description,
        string category,
        int durationMinutes,
        int assignedCount,
        int completedCount,
        bool isPublished) => new()
        {
            Id = id,
            OrganizationId = DemoOrganizationId,
            Title = title,
            Description = description,
            Category = category,
            DurationMinutes = durationMinutes,
            AssignedCount = assignedCount,
            CompletedCount = completedCount,
            IsPublished = isPublished,
        };
}
