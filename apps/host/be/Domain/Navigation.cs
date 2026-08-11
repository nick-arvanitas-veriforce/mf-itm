namespace MfItm.Host.Api.Domain;

/// <summary>
/// The permission strings the app checks. Kept as constants rather than an enum
/// so they can be stored as text in Postgres and read in the database without a
/// lookup table.
/// </summary>
public static class Permissions
{
    public const string EmployeeManagementView = "em:view";
    public const string DigitalTrainingView = "dtd:view";
    public const string ComplianceView = "compliance:view";
    public const string ReportsView = "reports:view";
    public const string ReportsViewQuarterly = "reports:view:quarterly";
    public const string SettingsView = "settings:view";
}

/// <summary>
/// A single top-level sidebar destination, as the host shell renders it.
/// <para>
/// This mirrors the shape the host's <c>App.tsx</c> currently hardcodes in its
/// <c>destinations</c> array. The API returns only the destinations the user may
/// see, so the shell renders the list it is given and performs no filtering of
/// its own — a UI that filters client-side has already shipped the full menu to
/// the browser.
/// </para>
/// </summary>
public sealed record NavItem
{
    /// <summary>Stable id; also the route's first segment.</summary>
    public required string Id { get; init; }

    public required string Label { get; init; }

    /// <summary>
    /// Icon NAME, not markup — the shell maps it to a FontAwesome import. The
    /// API never sends icon markup or class names, which would couple the
    /// backend to the frontend's icon library version.
    /// </summary>
    public string? Icon { get; init; }

    /// <summary>
    /// The Module Federation module to mount, e.g. <c>em/Widget</c>. Null for
    /// destinations the shell renders itself, or for pure parent rows.
    /// </summary>
    public string? RemoteId { get; init; }

    /// <summary>Numeric badge (e.g. open compliance items). Null renders no badge.</summary>
    public int? Badge { get; init; }

    /// <summary>Nested rows. Empty rather than null so the client can map without a guard.</summary>
    public IReadOnlyList<NavItem> Children { get; init; } = [];
}

/// <summary>What the shell needs on boot: who the user is, and what to render.</summary>
public sealed record SessionResponse
{
    public required UserDto User { get; init; }
    public required OrganizationDto Organization { get; init; }

    /// <summary>Organizations the user may switch to, for the AppBar picker.</summary>
    public required IReadOnlyList<OrganizationDto> Organizations { get; init; }

    /// <summary>Sidebar destinations, already filtered to what this user may see.</summary>
    public required IReadOnlyList<NavItem> Navigation { get; init; }

    /// <summary>
    /// The user's raw permissions. The nav is already filtered, but remotes need
    /// these for finer-grained decisions (e.g. showing an "Add worker" button).
    /// </summary>
    public required IReadOnlyList<string> Permissions { get; init; }
}

public sealed record UserDto
{
    public required string Id { get; init; }
    public required string Name { get; init; }
    public required string Email { get; init; }
}

public sealed record OrganizationDto
{
    public required string Id { get; init; }
    public required string Name { get; init; }
}
