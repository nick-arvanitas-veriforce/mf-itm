using Microsoft.EntityFrameworkCore;
using MfItm.ServiceDefaults;

namespace MfItm.Dtd.Api.Data;

/// <summary>Lets `dotnet ef` build a <see cref="DtdDbContext"/> without a running database.</summary>
public sealed class DtdDesignTimeFactory : DesignTimeDbContextFactoryBase<DtdDbContext>
{
    protected override DtdDbContext Create(DbContextOptions<DtdDbContext> options) => new(options);
}
