using Microsoft.EntityFrameworkCore;
using MfItm.Dtd.Api.Data;
using MfItm.ServiceDefaults;

// The DIGITAL TRAINING DELIVERY backend — the course catalog behind the `dtd`
// remote.
//
// The DTD screen is still a placeholder, so this service is intentionally the
// thinnest of the three: a real catalog endpoint on the same infrastructure as
// the others, ready to grow when the domain firms up.

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

builder.Services.AddDbContext<DtdDbContext>(options =>
    options.UseNpgsql(ServiceDefaults.ResolveConnectionString(builder.Configuration)));

var app = builder.Build();

app.UseServiceDefaults();

await using (var scope = app.Services.CreateAsyncScope())
{
    var db = scope.ServiceProvider.GetRequiredService<DtdDbContext>();
    await db.Database.MigrateAsync();
    await DtdSeeder.SeedAsync(db);
}

// ---------------------------------------------------------------- courses ---

app.MapGet("/api/courses", async (
    DtdDbContext db,
    string? organizationId,
    string? category,
    bool? published,
    CancellationToken cancellationToken) =>
{
    var query = db.Courses
        .AsNoTracking()
        .Where(course => course.OrganizationId == (organizationId ?? DtdSeeder.DemoOrganizationId));

    if (!string.IsNullOrWhiteSpace(category))
    {
        query = query.Where(course => course.Category == category);
    }

    // Tri-state on purpose: null returns drafts AND published, so the catalog can
    // show everything while a "Published" filter narrows it.
    if (published is not null)
    {
        query = query.Where(course => course.IsPublished == published);
    }

    var courses = await query
        .OrderBy(course => course.Title)
        .Select(course => CourseDto.From(course))
        .ToListAsync(cancellationToken);

    return Results.Ok(courses);
})
.WithName("ListCourses")
.WithSummary("The course catalog for an organization.");

app.MapGet("/api/courses/{id}", async (DtdDbContext db, string id, CancellationToken cancellationToken) =>
{
    var course = await db.Courses.AsNoTracking()
        .SingleOrDefaultAsync(candidate => candidate.Id == id, cancellationToken);

    return course is null
        ? Results.NotFound(new { message = $"No course with id '{id}'." })
        : Results.Ok(CourseDto.From(course));
})
.WithName("GetCourse")
.WithSummary("A single course by id.");

app.Run();

public sealed record CourseDto
{
    public required string Id { get; init; }
    public required string Title { get; init; }
    public required string Description { get; init; }
    public required string Category { get; init; }
    public required int DurationMinutes { get; init; }
    public required int AssignedCount { get; init; }
    public required int CompletedCount { get; init; }
    public required bool IsPublished { get; init; }

    /// <summary>
    /// Completion as 0-100, computed here rather than in the UI so every client
    /// rounds it the same way. Zero assignments is 0%, not a division by zero.
    /// </summary>
    public required int CompletionPercent { get; init; }

    public static CourseDto From(Course course) => new()
    {
        Id = course.Id,
        Title = course.Title,
        Description = course.Description,
        Category = course.Category,
        DurationMinutes = course.DurationMinutes,
        AssignedCount = course.AssignedCount,
        CompletedCount = course.CompletedCount,
        IsPublished = course.IsPublished,
        CompletionPercent = course.AssignedCount == 0
            ? 0
            : (int)Math.Round(course.CompletedCount * 100.0 / course.AssignedCount),
    };
}
