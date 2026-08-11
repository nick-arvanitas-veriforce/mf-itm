// Design-time DbContext construction for `dotnet ef`.
//
// Without this, the EF tools build and RUN Program.cs to find the DbContext,
// which means `dotnet ef migrations add` would require a live database — the
// app resolves its connection string at startup and throws when there is none.
// Generating a migration is an offline, source-only operation and should not
// need Neon to be reachable.
//
// This file is LINKED into each service (see Directory.Build.props); each one
// subclasses the generic base with its own DbContext type.

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace MfItm.ServiceDefaults;

/// <summary>
/// Builds a <typeparamref name="TContext"/> for the EF CLI. Uses DATABASE_URL when
/// it is set (so <c>dotnet ef database update</c> can target a real database) and
/// otherwise a placeholder — enough for EF to read the model and emit a migration,
/// since scaffolding never opens a connection.
/// </summary>
public abstract class DesignTimeDbContextFactoryBase<TContext> : IDesignTimeDbContextFactory<TContext>
    where TContext : DbContext
{
    public TContext CreateDbContext(string[] args)
    {
        var raw = Environment.GetEnvironmentVariable("DATABASE_URL");

        var connectionString = string.IsNullOrWhiteSpace(raw)
            ? "Host=localhost;Database=mf_itm_design_time;Username=postgres"
            : ServiceDefaults.NormalizeConnectionString(raw);

        var options = new DbContextOptionsBuilder<TContext>()
            .UseNpgsql(connectionString)
            .Options;

        return Create(options);
    }

    /// <summary>Each service returns its own context — the base cannot `new` a generic type with a required ctor arg.</summary>
    protected abstract TContext Create(DbContextOptions<TContext> options);
}
