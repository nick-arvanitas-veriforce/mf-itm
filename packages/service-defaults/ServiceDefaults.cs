// Cross-cutting setup shared by all three APIs. This file is LINKED into each
// project (see each .csproj) rather than being its own package — the services
// deploy independently, and a shared NuGet package would put a build-time
// coupling between them that the micro-frontend split is trying to avoid.
//
// Everything here is deployment plumbing (CORS, health, port binding, Neon
// connection strings). Domain logic stays in each service.

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace MfItm.ServiceDefaults;

public static class ServiceDefaults
{
    /// <summary>
    /// The CORS policy name. On Render every service is its own origin
    /// (*.onrender.com), and the browser calls these APIs DIRECTLY from the
    /// frontends' origins — there is no same-origin proxy in front of them — so
    /// CORS is required, not optional.
    /// </summary>
    public const string CorsPolicy = "mf-itm-frontends";

    /// <summary>
    /// Registers CORS, health checks and OpenAPI. <paramref name="allowedOrigins"/>
    /// comes from the CORS_ALLOWED_ORIGINS env var (comma-separated).
    /// </summary>
    public static WebApplicationBuilder AddServiceDefaults(this WebApplicationBuilder builder)
    {
        var origins = ReadAllowedOrigins(builder.Configuration);

        builder.Services.AddCors(options =>
            options.AddPolicy(CorsPolicy, policy =>
            {
                if (origins.Length == 0)
                {
                    // No explicit allowlist (local dev): reflect any origin. Credentials
                    // cannot be combined with a wildcard, and dev has no cookies to send.
                    policy.SetIsOriginAllowed(_ => true).AllowAnyHeader().AllowAnyMethod();
                }
                else
                {
                    policy.WithOrigins(origins)
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        // The host BE issues a session cookie for the demo user; the
                        // browser only sends it cross-origin when credentials are allowed.
                        .AllowCredentials();
                }
            }));

        builder.Services.AddHealthChecks();
        builder.Services.AddOpenApi();

        return builder;
    }

    /// <summary>
    /// Applies the shared middleware. Order matters: CORS must run before the
    /// endpoints so preflight OPTIONS requests are answered.
    /// </summary>
    public static WebApplication UseServiceDefaults(this WebApplication app)
    {
        // The OpenAPI document is exposed in every environment — these are demo
        // services with no secrets in the schema, and it makes the deployed URLs
        // self-describing.
        app.MapOpenApi();
        app.UseCors(CorsPolicy);

        // Render pings this to decide whether a deploy is live. It deliberately does
        // NOT check the database: a Neon outage should surface as failing requests,
        // not as Render tearing down an otherwise-healthy instance.
        app.MapHealthChecks("/health").AllowAnonymous();

        return app;
    }

    private static string[] ReadAllowedOrigins(IConfiguration configuration) =>
        (configuration["CORS_ALLOWED_ORIGINS"] ?? string.Empty)
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            // Origins must have no trailing slash or the browser's comparison fails.
            .Select(origin => origin.TrimEnd('/'))
            .ToArray();

    /// <summary>
    /// Builds an Npgsql connection string for Neon.
    /// <para>
    /// Neon hands out a URI (<c>postgresql://user:pass@host/db?sslmode=require</c>),
    /// which Npgsql does not accept — it wants key/value pairs. Render's own
    /// Postgres <c>fromDatabase</c> bindings use the same URI shape, so this
    /// accepts either form and normalises to what Npgsql expects.
    /// </para>
    /// </summary>
    public static string ResolveConnectionString(IConfiguration configuration)
    {
        var raw = configuration.GetConnectionString("Default")
            ?? configuration["DATABASE_URL"]
            ?? throw new InvalidOperationException(
                "No database connection configured. Set DATABASE_URL to the Neon connection " +
                "string (postgresql://... or Npgsql key/value form).");

        return NormalizeConnectionString(raw);
    }

    /// <summary>Converts a <c>postgres(ql)://</c> URI to Npgsql key/value form; passes other forms through.</summary>
    public static string NormalizeConnectionString(string raw)
    {
        raw = raw.Trim();

        if (!raw.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase)
            && !raw.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
        {
            return raw;
        }

        var uri = new Uri(raw);
        var userInfo = uri.UserInfo.Split(':', 2);
        var query = Microsoft.AspNetCore.WebUtilities.QueryHelpers.ParseQuery(uri.Query);

        var csb = new Npgsql.NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.IsDefaultPort ? 5432 : uri.Port,
            Database = uri.AbsolutePath.Trim('/'),
            Username = Uri.UnescapeDataString(userInfo[0]),
            Password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : null,
            // Honour the URI's own sslmode; default to Require, which is what Neon
            // needs (and what it puts in the string it hands you). Hardcoding Require
            // would make a local `sslmode=disable` database unreachable for dev.
            SslMode = ParseSslMode(query.TryGetValue("sslmode", out var sslMode) ? sslMode.ToString() : null),
        };

        // Neon's pooler closes idle connections; Npgsql's own pool must not hand out
        // a socket the server has already dropped.
        csb.KeepAlive = 30;

        // Neon puts the endpoint id in this option for drivers that don't send SNI.
        if (query.TryGetValue("options", out var options) && !string.IsNullOrEmpty(options))
        {
            csb.Options = options.ToString();
        }

        return csb.ConnectionString;
    }

    /// <summary>
    /// Maps a libpq <c>sslmode</c> value to Npgsql's enum. Npgsql spells two of them
    /// differently from libpq (<c>verify-ca</c> / <c>verify-full</c>), so this cannot
    /// be a plain <c>Enum.TryParse</c>. Unrecognised values fall back to Require
    /// rather than throwing — a stricter-than-asked-for connection is the safe error.
    /// </summary>
    private static Npgsql.SslMode ParseSslMode(string? value) => value?.ToLowerInvariant() switch
    {
        "disable" => Npgsql.SslMode.Disable,
        "allow" => Npgsql.SslMode.Allow,
        "prefer" => Npgsql.SslMode.Prefer,
        "require" => Npgsql.SslMode.Require,
        "verify-ca" => Npgsql.SslMode.VerifyCA,
        "verify-full" => Npgsql.SslMode.VerifyFull,
        _ => Npgsql.SslMode.Require,
    };
}
