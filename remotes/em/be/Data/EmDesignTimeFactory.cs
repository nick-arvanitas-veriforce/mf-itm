using Microsoft.EntityFrameworkCore;
using MfItm.ServiceDefaults;

namespace MfItm.Em.Api.Data;

/// <summary>Lets `dotnet ef` build an <see cref="EmDbContext"/> without a running database.</summary>
public sealed class EmDesignTimeFactory : DesignTimeDbContextFactoryBase<EmDbContext>
{
    protected override EmDbContext Create(DbContextOptions<EmDbContext> options) => new(options);
}
