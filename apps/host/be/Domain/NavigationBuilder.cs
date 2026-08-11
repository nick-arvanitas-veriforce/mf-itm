namespace MfItm.Host.Api.Domain;

/// <summary>
/// Turns a permission set into the sidebar the shell should render.
/// <para>
/// The full menu is declared once here, each entry tagged with the permission it
/// requires; building a user's nav is then a filter over that declaration. This
/// keeps "what the app contains" separate from "what this user may see", so
/// adding a destination is a one-line change that cannot accidentally skip its
/// permission check.
/// </para>
/// </summary>
public static class NavigationBuilder
{
    /// <summary>A menu entry plus the permission gating it.</summary>
    private sealed record Entry(string RequiredPermission, NavItem Item, Entry[] Children);

    private static Entry Leaf(string permission, NavItem item) => new(permission, item, []);

    /// <summary>
    /// The complete menu, in render order. Mirrors what <c>apps/host/src/App.tsx</c>
    /// hardcodes today; the shell now receives this filtered instead.
    /// </summary>
    private static readonly Entry[] Menu =
    [
        Leaf(Permissions.EmployeeManagementView, new NavItem
        {
            Id = "em",
            Label = "Employee Management",
            Icon = "users",
            RemoteId = "em/Widget",
        }),
        Leaf(Permissions.DigitalTrainingView, new NavItem
        {
            Id = "dtd",
            Label = "Digital Training",
            Icon = "graduation-cap",
            RemoteId = "dtd/Widget",
        }),
        Leaf(Permissions.ComplianceView, new NavItem
        {
            Id = "compliance",
            Label = "Compliance",
            Icon = "clipboard-check",
        }),
        new(Permissions.ReportsView,
            new NavItem { Id = "reports", Label = "Reports", Icon = "chart-line" },
            [
                Leaf(Permissions.ReportsView, new NavItem { Id = "reports-monthly", Label = "Monthly" }),
                // Quarterly is gated separately — the common case for nested nav is a
                // parent the user can see with children they cannot.
                Leaf(Permissions.ReportsViewQuarterly, new NavItem { Id = "reports-quarterly", Label = "Quarterly" }),
            ]),
        Leaf(Permissions.SettingsView, new NavItem
        {
            Id = "settings",
            Label = "Settings",
            Icon = "gear",
        }),
    ];

    /// <summary>
    /// Filters the menu to the destinations <paramref name="permissions"/> allows.
    /// A parent whose own permission is missing is dropped along with its children,
    /// even if a child's permission is held — the child is unreachable without its parent.
    /// </summary>
    public static IReadOnlyList<NavItem> Build(IReadOnlySet<string> permissions, IReadOnlyDictionary<string, int>? badges = null)
    {
        return Filter(Menu, permissions, badges);
    }

    private static List<NavItem> Filter(
        IReadOnlyCollection<Entry> entries,
        IReadOnlySet<string> permissions,
        IReadOnlyDictionary<string, int>? badges)
    {
        var result = new List<NavItem>(entries.Count);

        foreach (var entry in entries)
        {
            if (!permissions.Contains(entry.RequiredPermission))
            {
                continue;
            }

            var children = entry.Children.Length == 0
                ? []
                : Filter(entry.Children, permissions, badges);

            // A parent row exists only to hold children — if permissions removed all
            // of them, the row would navigate nowhere, so drop it too.
            if (entry.Children.Length > 0 && children.Count == 0)
            {
                continue;
            }

            result.Add(entry.Item with
            {
                Children = children,
                Badge = badges is not null && badges.TryGetValue(entry.Item.Id, out var badge) ? badge : null,
            });
        }

        return result;
    }
}
