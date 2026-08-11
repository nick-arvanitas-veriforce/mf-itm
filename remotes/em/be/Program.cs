using Microsoft.EntityFrameworkCore;
using MfItm.Em.Api.Data;
using MfItm.ServiceDefaults;

// The EMPLOYEE MANAGEMENT backend — the worker roster behind the `em` remote.
//
// Filtering, sorting and paging all happen HERE rather than in the browser. The
// remote's table previously held the whole array in memory and sliced it; that
// stops working as soon as the roster is bigger than one page.

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

builder.Services.AddDbContext<EmDbContext>(options =>
    options.UseNpgsql(ServiceDefaults.ResolveConnectionString(builder.Configuration)));

var app = builder.Build();

app.UseServiceDefaults();

await using (var scope = app.Services.CreateAsyncScope())
{
    var db = scope.ServiceProvider.GetRequiredService<EmDbContext>();
    await db.Database.MigrateAsync();
    await EmSeeder.SeedAsync(db);
}

// ---------------------------------------------------------------- workers ---

app.MapGet("/api/workers", async (
    EmDbContext db,
    string? organizationId,
    string? search,
    string? view,
    string? site,
    string? sort,
    string? direction,
    // Nullable so they are OPTIONAL. As non-nullable `int` these bind as required
    // and every request omitting them 400s — paging is a default, not something
    // each caller must restate.
    int? page,
    int? pageSize,
    CancellationToken cancellationToken) =>
{
    // Clamp rather than reject: an out-of-range page is a stale UI, not a client
    // bug worth failing the request over. pageSize is capped so a hand-edited
    // query string cannot ask for the entire table.
    var pageIndex = Math.Max(page ?? 0, 0);
    var size = pageSize is null or <= 0 ? 25 : Math.Min(pageSize.Value, 200);

    var query = db.Workers
        .AsNoTracking()
        .Where(worker => worker.OrganizationId == (organizationId ?? EmSeeder.DemoOrganizationId));

    query = view?.ToLowerInvariant() switch
    {
        "active" => query.Where(worker => worker.Status == WorkerStatus.Active),
        "inactive" => query.Where(worker => worker.Status == WorkerStatus.Inactive),
        // "all", null, or anything unrecognised: no status filter.
        _ => query,
    };

    if (!string.IsNullOrWhiteSpace(site))
    {
        query = query.Where(worker => worker.Site == site);
    }

    if (!string.IsNullOrWhiteSpace(search))
    {
        var term = $"%{search.Trim()}%";
        // ILIKE via EF.Functions.ILike — Postgres-native case-insensitive match.
        // ToLower().Contains() would also work but cannot use a text_pattern index.
        query = query.Where(worker =>
            EF.Functions.ILike(worker.Name, term)
            || EF.Functions.ILike(worker.Email, term)
            || EF.Functions.ILike(worker.Role, term)
            || EF.Functions.ILike(worker.EmployeeId, term));
    }

    var descending = string.Equals(direction, "desc", StringComparison.OrdinalIgnoreCase);

    // Sort key is mapped through a whitelist — never interpolated into SQL, and an
    // unknown key falls back to Name rather than erroring.
    query = (sort?.ToLowerInvariant(), descending) switch
    {
        ("status", false) => query.OrderBy(worker => worker.Status),
        ("status", true) => query.OrderByDescending(worker => worker.Status),
        ("compliance", false) => query.OrderBy(worker => worker.Compliance),
        ("compliance", true) => query.OrderByDescending(worker => worker.Compliance),
        ("role", false) => query.OrderBy(worker => worker.Role),
        ("role", true) => query.OrderByDescending(worker => worker.Role),
        ("site", false) => query.OrderBy(worker => worker.Site),
        ("site", true) => query.OrderByDescending(worker => worker.Site),
        ("training", false) => query.OrderBy(worker => worker.Training),
        ("training", true) => query.OrderByDescending(worker => worker.Training),
        ("lastactive", false) => query.OrderBy(worker => worker.LastActive),
        ("lastactive", true) => query.OrderByDescending(worker => worker.LastActive),
        (_, true) => query.OrderByDescending(worker => worker.Name),
        _ => query.OrderBy(worker => worker.Name),
    };

    // Id breaks ties: without it, rows with equal sort values can swap between
    // pages and the same worker appears twice (or never).
    query = ((IOrderedQueryable<Worker>)query).ThenBy(worker => worker.Id);

    // Counted before paging — the table footer needs the size of the FILTERED set.
    var total = await query.CountAsync(cancellationToken);

    var items = await query
        .Skip(pageIndex * size)
        .Take(size)
        .Select(worker => WorkerDto.From(worker))
        .ToListAsync(cancellationToken);

    return Results.Ok(new PagedResult<WorkerDto>
    {
        Items = items,
        Total = total,
        Page = pageIndex,
        PageSize = size,
    });
})
.WithName("ListWorkers")
.WithSummary("The worker roster, filtered, sorted and paged.");

app.MapGet("/api/workers/{id}", async (EmDbContext db, string id, CancellationToken cancellationToken) =>
{
    var worker = await db.Workers.AsNoTracking()
        .SingleOrDefaultAsync(candidate => candidate.Id == id, cancellationToken);

    return worker is null
        ? Results.NotFound(new { message = $"No worker with id '{id}'." })
        : Results.Ok(WorkerDto.From(worker));
})
.WithName("GetWorker")
.WithSummary("A single worker by id.");

// The distinct sites, for the Site filter chip's options. Derived from the data
// rather than hardcoded in the UI so a new site appears in the filter by itself.
app.MapGet("/api/sites", async (EmDbContext db, string? organizationId, CancellationToken cancellationToken) =>
    await db.Workers
        .AsNoTracking()
        .Where(worker => worker.OrganizationId == (organizationId ?? EmSeeder.DemoOrganizationId))
        .Select(worker => worker.Site)
        .Distinct()
        .OrderBy(site => site)
        .ToListAsync(cancellationToken))
.WithName("ListSites")
.WithSummary("Distinct sites, for the site filter options.");

app.Run();

/// <summary>One page of results plus the total, which the table footer needs.</summary>
public sealed record PagedResult<T>
{
    public required IReadOnlyList<T> Items { get; init; }
    public required int Total { get; init; }
    public required int Page { get; init; }
    public required int PageSize { get; init; }
}

/// <summary>
/// The wire shape of a worker. Serialized with the camelCase status/compliance
/// strings the existing TS types already use (<c>'active'</c>, <c>'expiring'</c>),
/// so the remote's <c>statusColors</c>/<c>complianceLabels</c> maps keep working
/// unchanged against API data.
/// </summary>
public sealed record WorkerDto
{
    public required string Id { get; init; }
    public required string Name { get; init; }
    public required string Email { get; init; }
    public required string Phone { get; init; }
    public required string EmployeeId { get; init; }
    public required string Status { get; init; }
    public required string Compliance { get; init; }
    public required string Role { get; init; }
    public required string Site { get; init; }
    public required int Training { get; init; }

    /// <summary>ISO date (yyyy-MM-dd) — the remote formats it for display.</summary>
    public required string LastActive { get; init; }

    public static WorkerDto From(Worker worker) => new()
    {
        Id = worker.Id,
        Name = worker.Name,
        Email = worker.Email,
        Phone = worker.Phone,
        EmployeeId = worker.EmployeeId,
        Status = worker.Status.ToString().ToLowerInvariant(),
        Compliance = worker.Compliance.ToString().ToLowerInvariant(),
        Role = worker.Role,
        Site = worker.Site,
        Training = worker.Training,
        LastActive = worker.LastActive.ToString("yyyy-MM-dd"),
    };
}
