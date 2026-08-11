using Microsoft.EntityFrameworkCore;
using MfItm.ServiceDefaults;

namespace MfItm.Host.Api.Data;

/// <summary>Lets `dotnet ef` build a <see cref="HostDbContext"/> without a running database.</summary>
public sealed class HostDesignTimeFactory : DesignTimeDbContextFactoryBase<HostDbContext>
{
    protected override HostDbContext Create(DbContextOptions<HostDbContext> options) => new(options);
}
