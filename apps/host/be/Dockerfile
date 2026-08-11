# Host BE — user, permissions, and the navigation the shell renders.
#
# Built from the REPO ROOT (render.yaml sets dockerContext: .), because the
# project links shared source from packages/service-defaults and inherits the
# root Directory.Build.props. A build context of just this folder cannot see
# either.

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Restore before copying the rest of the source so the (slow) NuGet restore is
# cached and only re-runs when the project file or shared build props change.
COPY Directory.Build.props ./
COPY apps/host/be/MfItm.Host.Api.csproj apps/host/be/
# Directory.Build.props globs these into the compile set, so restore needs them
# present or it evaluates an empty ItemGroup and the later build fails.
COPY packages/service-defaults/ packages/service-defaults/
RUN dotnet restore apps/host/be/MfItm.Host.Api.csproj

COPY apps/host/be/ apps/host/be/
RUN dotnet publish apps/host/be/MfItm.Host.Api.csproj -c Release -o /app --no-restore

# Runtime image ships without the SDK — smaller, and no compiler on a public host.
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app ./

# Render injects $PORT at runtime and routes to it. Resolve the bind address in
# the ENTRYPOINT rather than an ENV: `ENV` expands at BUILD time, which would
# freeze the port to its default and ignore whatever Render assigns.
# 10000 is the fallback for a plain `docker run` with no PORT set.
EXPOSE 10000

# Run as the image's non-root user: nothing here needs privileges.
USER $APP_UID

# Shell form so ${PORT} is expanded by the shell at container start.
ENTRYPOINT dotnet MfItm.Host.Api.dll --urls "http://+:${PORT:-10000}"
