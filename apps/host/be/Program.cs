using Microsoft.EntityFrameworkCore;
using MfItm.Host.Api.Data;
using MfItm.Host.Api.Domain;
using MfItm.ServiceDefaults;

// The HOST backend. It owns identity and access for the shell: which user is
// signed in, which organization they are acting in, and — derived from that —
// which sidebar destinations and tabs the shell renders.
//
// This is deliberately the only service that knows the whole menu. The remotes
// serve their own data and never decide whether they are reachable.

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

builder.Services.AddDbContext<HostDbContext>(options =>
    options.UseNpgsql(ServiceDefaults.ResolveConnectionString(builder.Configuration)));

var app = builder.Build();

app.UseServiceDefaults();

// Apply migrations at startup. Fine for a demo on a single instance; for a real
// deployment run migrations as a separate release step, since concurrent
// instances would otherwise race to apply the same migration.
await using (var scope = app.Services.CreateAsyncScope())
{
    var db = scope.ServiceProvider.GetRequiredService<HostDbContext>();
    await db.Database.MigrateAsync();
    await HostSeeder.SeedAsync(db);
}

// ---------------------------------------------------------------- session ---

// Everything the shell needs on boot, in ONE request: user, organization, the
// org list for the picker, the filtered nav, and the raw permissions. The shell
// blocks its first paint on this, so splitting it into four calls would cost
// four serial round-trips before anything renders.
app.MapGet("/api/session", async (
    HostDbContext db,
    HttpContext httpContext,
    string? organizationId,
    CancellationToken cancellationToken) =>
{
    // Authentication stands in for a real IdP: the demo user is fixed, overridable
    // with a header so the different permission sets can be exercised in the
    // browser without a login screen. A real deployment reads this from the
    // validated token and never from a client-supplied header.
    var email = httpContext.Request.Headers["X-Demo-User"].FirstOrDefault()
        ?? HostSeeder.DemoUserEmail;

    var user = await db.Users
        .AsNoTracking()
        .Include(candidate => candidate.Memberships)
        .ThenInclude(membership => membership.Organization)
        .SingleOrDefaultAsync(candidate => candidate.Email == email, cancellationToken);

    if (user is null)
    {
        return Results.NotFound(new { message = $"No user with email '{email}'." });
    }

    if (user.Memberships.Count == 0)
    {
        // A user with no memberships has no organization to act in, so there is no
        // meaningful session to return — distinct from "not signed in".
        return Results.Problem(
            title: "No organization access",
            detail: $"User '{email}' belongs to no organization.",
            statusCode: StatusCodes.Status403Forbidden);
    }

    // Act in the requested org when the user is a member of it; otherwise their
    // default. The name ordering is only a tiebreak for data with no default set —
    // without it the choice falls to database row order, which is not stable.
    var membership = organizationId is null
        ? user.Memberships
            .OrderByDescending(candidate => candidate.IsDefault)
            .ThenBy(candidate => candidate.Organization!.Name, StringComparer.Ordinal)
            .First()
        : user.Memberships.FirstOrDefault(candidate => candidate.OrganizationId == organizationId);

    if (membership is null)
    {
        return Results.Problem(
            title: "Organization not accessible",
            detail: $"User '{email}' is not a member of organization '{organizationId}'.",
            statusCode: StatusCodes.Status403Forbidden);
    }

    var permissions = membership.Permissions.ToHashSet(StringComparer.Ordinal);

    // The Compliance badge count. Hardcoded here because compliance has no
    // service of its own yet; when it gets one, the host fetches it rather than
    // owning the number.
    var badges = new Dictionary<string, int> { ["compliance"] = 6 };

    return Results.Ok(new SessionResponse
    {
        User = new UserDto { Id = user.Id, Name = user.Name, Email = user.Email },
        Organization = new OrganizationDto
        {
            Id = membership.OrganizationId,
            Name = membership.Organization!.Name,
        },
        Organizations = user.Memberships
            .Select(candidate => new OrganizationDto
            {
                Id = candidate.OrganizationId,
                Name = candidate.Organization!.Name,
            })
            .OrderBy(organization => organization.Name, StringComparer.Ordinal)
            .ToList(),
        Navigation = NavigationBuilder.Build(permissions, badges),
        Permissions = membership.Permissions.Order(StringComparer.Ordinal).ToList(),
    });
})
.WithName("GetSession")
.WithSummary("The signed-in user, their organization, and the navigation they may see.");

app.Run();
