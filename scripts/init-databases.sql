-- Creates one database per service, matching the deployed layout on Neon.
--
-- Runs once, on the FIRST boot of an empty Postgres volume (docker-compose mounts
-- it into /docker-entrypoint-initdb.d). It does not run again while the volume
-- exists — `pnpm db:reset` deletes the volume to force a fresh start.
--
-- The TABLES are not created here: each service applies its own EF Core migrations
-- at startup, so the schema always matches the code that is running.

CREATE DATABASE mfitm_host;
CREATE DATABASE mfitm_em;
CREATE DATABASE mfitm_dtd;
