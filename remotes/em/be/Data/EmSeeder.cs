using Microsoft.EntityFrameworkCore;

namespace MfItm.Em.Api.Data;

/// <summary>
/// The demo roster, ported from the sample data the EM remote used to hold
/// inline (<c>remotes/em/src/workers.ts</c>). That array is now gone — the
/// remote fetches this instead, so the data lives in one place.
/// </summary>
public static class EmSeeder
{
    /// <summary>
    /// The org these workers belong to. Matches the host BE's seeded
    /// <c>org-northwind</c> so the two services agree on organization ids.
    /// </summary>
    public const string DemoOrganizationId = "org-northwind";

    public static async Task SeedAsync(EmDbContext db, CancellationToken cancellationToken = default)
    {
        // Idempotent: Render restarts containers freely and this runs on every boot.
        if (await db.Workers.AnyAsync(cancellationToken))
        {
            return;
        }

        db.Workers.AddRange(Rows);
        await db.SaveChangesAsync(cancellationToken);
    }

    private static Worker New(
        string id,
        string name,
        string email,
        string phone,
        string employeeId,
        WorkerStatus status,
        ComplianceStatus compliance,
        string role,
        string site,
        int training,
        DateOnly lastActive) => new()
        {
            Id = id,
            OrganizationId = DemoOrganizationId,
            Name = name,
            Email = email,
            Phone = phone,
            EmployeeId = employeeId,
            Status = status,
            Compliance = compliance,
            Role = role,
            Site = site,
            Training = training,
            LastActive = lastActive,
        };

    private static readonly Worker[] Rows =
    [
        New("w-1041", "Priya Raghunathan", "priya.raghunathan@example.com", "(512) 555-0147", "EMP-1041", WorkerStatus.Active, ComplianceStatus.Compliant, "Site Supervisor", "Houston, TX", 100, new DateOnly(2026, 8, 11)),
        New("w-1042", "Marcus Adeyemi", "marcus.adeyemi@example.com", "(713) 555-0182", "EMP-1042", WorkerStatus.Active, ComplianceStatus.Expiring, "Millwright", "Houston, TX", 82, new DateOnly(2026, 8, 10)),
        New("w-1043", "Sofia Marchetti", "sofia.marchetti@example.com", "(281) 555-0119", "EMP-1043", WorkerStatus.Active, ComplianceStatus.Compliant, "Safety Coordinator", "Baytown, TX", 96, new DateOnly(2026, 8, 11)),
        New("w-1044", "Daniel Okonkwo", "daniel.okonkwo@example.com", "(403) 555-0166", "EMP-1044", WorkerStatus.Pending, ComplianceStatus.Expired, "Electrician", "Calgary, AB", 41, new DateOnly(2026, 8, 4)),
        New("w-1045", "Hannah Whitfield", "hannah.whitfield@example.com", "(587) 555-0173", "EMP-1045", WorkerStatus.Active, ComplianceStatus.Compliant, "Scaffolder", "Calgary, AB", 88, new DateOnly(2026, 8, 9)),
        New("w-1046", "Chen Wei", "chen.wei@example.com", "(604) 555-0128", "EMP-1046", WorkerStatus.Active, ComplianceStatus.Expiring, "Welder", "Burnaby, BC", 74, new DateOnly(2026, 8, 8)),
        New("w-1047", "Aaliyah Brooks", "aaliyah.brooks@example.com", "(225) 555-0194", "EMP-1047", WorkerStatus.Active, ComplianceStatus.Compliant, "Instrument Tech", "Baton Rouge, LA", 100, new DateOnly(2026, 8, 11)),
        New("w-1048", "Tomás Delgado", "tomas.delgado@example.com", "(956) 555-0151", "EMP-1048", WorkerStatus.Inactive, ComplianceStatus.Expired, "Pipefitter", "Laredo, TX", 33, new DateOnly(2026, 6, 19)),
        New("w-1049", "Nadia Haddad", "nadia.haddad@example.com", "(313) 555-0137", "EMP-1049", WorkerStatus.Active, ComplianceStatus.Compliant, "Quality Inspector", "Detroit, MI", 91, new DateOnly(2026, 8, 10)),
        New("w-1050", "Owen Fitzgerald", "owen.fitzgerald@example.com", "(216) 555-0142", "EMP-1050", WorkerStatus.Pending, ComplianceStatus.Expiring, "Rigger", "Cleveland, OH", 58, new DateOnly(2026, 8, 7)),
        New("w-1051", "Grace Mwangi", "grace.mwangi@example.com", "(469) 555-0188", "EMP-1051", WorkerStatus.Active, ComplianceStatus.Compliant, "Site Supervisor", "Dallas, TX", 100, new DateOnly(2026, 8, 11)),
        New("w-1052", "Liam O’Sullivan", "liam.osullivan@example.com", "(972) 555-0163", "EMP-1052", WorkerStatus.Active, ComplianceStatus.Compliant, "Crane Operator", "Dallas, TX", 94, new DateOnly(2026, 8, 9)),
        New("w-1053", "Yuki Tanaka", "yuki.tanaka@example.com", "(206) 555-0175", "EMP-1053", WorkerStatus.Active, ComplianceStatus.Expiring, "Boilermaker", "Seattle, WA", 69, new DateOnly(2026, 8, 6)),
        New("w-1054", "Rebecca Lindqvist", "rebecca.lindqvist@example.com", "(303) 555-0121", "EMP-1054", WorkerStatus.Active, ComplianceStatus.Compliant, "Safety Coordinator", "Denver, CO", 97, new DateOnly(2026, 8, 11)),
        New("w-1055", "Andre Botha", "andre.botha@example.com", "(720) 555-0159", "EMP-1055", WorkerStatus.Inactive, ComplianceStatus.Expired, "Millwright", "Denver, CO", 22, new DateOnly(2026, 5, 28)),
        New("w-1056", "Fatima Al-Rashid", "fatima.alrashid@example.com", "(602) 555-0134", "EMP-1056", WorkerStatus.Active, ComplianceStatus.Compliant, "Electrician", "Phoenix, AZ", 89, new DateOnly(2026, 8, 10)),
        New("w-1057", "Julien Beaumont", "julien.beaumont@example.com", "(514) 555-0146", "EMP-1057", WorkerStatus.Active, ComplianceStatus.Expiring, "Welder", "Montréal, QC", 77, new DateOnly(2026, 8, 8)),
        New("w-1058", "Devon Carter", "devon.carter@example.com", "(404) 555-0192", "EMP-1058", WorkerStatus.Pending, ComplianceStatus.Expired, "Scaffolder", "Atlanta, GA", 15, new DateOnly(2026, 8, 5)),
        New("w-1059", "Ingrid Solberg", "ingrid.solberg@example.com", "(651) 555-0177", "EMP-1059", WorkerStatus.Active, ComplianceStatus.Compliant, "Quality Inspector", "Saint Paul, MN", 100, new DateOnly(2026, 8, 11)),
        New("w-1060", "Rajesh Patel", "rajesh.patel@example.com", "(732) 555-0125", "EMP-1060", WorkerStatus.Active, ComplianceStatus.Compliant, "Instrument Tech", "Edison, NJ", 93, new DateOnly(2026, 8, 9)),
        New("w-1061", "Camille Dubois", "camille.dubois@example.com", "(819) 555-0168", "EMP-1061", WorkerStatus.Active, ComplianceStatus.Expiring, "Pipefitter", "Gatineau, QC", 64, new DateOnly(2026, 8, 7)),
        New("w-1062", "Malik Johnson", "malik.johnson@example.com", "(410) 555-0113", "EMP-1062", WorkerStatus.Active, ComplianceStatus.Compliant, "Rigger", "Baltimore, MD", 86, new DateOnly(2026, 8, 10)),
        New("w-1063", "Elena Petrova", "elena.petrova@example.com", "(917) 555-0181", "EMP-1063", WorkerStatus.Active, ComplianceStatus.Compliant, "Site Supervisor", "Queens, NY", 99, new DateOnly(2026, 8, 11)),
        New("w-1064", "Samuel Nkemelu", "samuel.nkemelu@example.com", "(832) 555-0156", "EMP-1064", WorkerStatus.Inactive, ComplianceStatus.Expired, "Crane Operator", "Houston, TX", 48, new DateOnly(2026, 4, 30)),
        New("w-1065", "Mei-Ling Chang", "meiling.chang@example.com", "(408) 555-0139", "EMP-1065", WorkerStatus.Active, ComplianceStatus.Compliant, "Safety Coordinator", "San Jose, CA", 95, new DateOnly(2026, 8, 11)),
        New("w-1066", "Cormac Byrne", "cormac.byrne@example.com", "(617) 555-0164", "EMP-1066", WorkerStatus.Active, ComplianceStatus.Expiring, "Boilermaker", "Boston, MA", 71, new DateOnly(2026, 8, 6)),
        New("w-1067", "Zainab Osei", "zainab.osei@example.com", "(773) 555-0129", "EMP-1067", WorkerStatus.Active, ComplianceStatus.Compliant, "Electrician", "Chicago, IL", 90, new DateOnly(2026, 8, 10)),
        New("w-1068", "Victor Almeida", "victor.almeida@example.com", "(305) 555-0171", "EMP-1068", WorkerStatus.Pending, ComplianceStatus.Expiring, "Welder", "Miami, FL", 52, new DateOnly(2026, 8, 8)),
        New("w-1069", "Astrid Nilsson", "astrid.nilsson@example.com", "(503) 555-0148", "EMP-1069", WorkerStatus.Active, ComplianceStatus.Compliant, "Millwright", "Portland, OR", 98, new DateOnly(2026, 8, 11)),
        New("w-1070", "Kwame Mensah", "kwame.mensah@example.com", "(614) 555-0183", "EMP-1070", WorkerStatus.Active, ComplianceStatus.Compliant, "Quality Inspector", "Columbus, OH", 92, new DateOnly(2026, 8, 9)),
        New("w-1071", "Isabelle Rousseau", "isabelle.rousseau@example.com", "(418) 555-0117", "EMP-1071", WorkerStatus.Active, ComplianceStatus.Expiring, "Instrument Tech", "Québec, QC", 67, new DateOnly(2026, 8, 7)),
        New("w-1072", "Trevor Osborne", "trevor.osborne@example.com", "(702) 555-0195", "EMP-1072", WorkerStatus.Inactive, ComplianceStatus.Expired, "Scaffolder", "Las Vegas, NV", 29, new DateOnly(2026, 6, 2)),
        New("w-1073", "Amara Chukwu", "amara.chukwu@example.com", "(919) 555-0152", "EMP-1073", WorkerStatus.Active, ComplianceStatus.Compliant, "Pipefitter", "Raleigh, NC", 87, new DateOnly(2026, 8, 10)),
        New("w-1074", "Henrik Larsen", "henrik.larsen@example.com", "(414) 555-0126", "EMP-1074", WorkerStatus.Active, ComplianceStatus.Compliant, "Crane Operator", "Milwaukee, WI", 100, new DateOnly(2026, 8, 11)),
        New("w-1075", "Lucia Fernández", "lucia.fernandez@example.com", "(210) 555-0179", "EMP-1075", WorkerStatus.Active, ComplianceStatus.Expiring, "Rigger", "San Antonio, TX", 73, new DateOnly(2026, 8, 6)),
    ];
}
