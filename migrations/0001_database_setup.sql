CREATE EXTENSION citus;

-- Requires PostgreSQL 18+ for uuid7 support
CREATE DOMAIN uuid7 AS uuid
  CHECK (uuid_extract_version(value) = 7);

CREATE DOMAIN phone_number AS TEXT
  CHECK ( value ~ '^\+\d{12}$' );
