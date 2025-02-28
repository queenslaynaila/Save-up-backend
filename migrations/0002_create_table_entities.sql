DO $$
BEGIN
  CREATE TYPE enum_entity_type AS ENUM (
    'User',
    'Group',
    'Donor'
  );
EXCEPTION
  WHEN DUPLICATE_OBJECT THEN NULL;
END
$$;

CREATE TABLE IF NOT EXISTS entities (
    id              SERIAL PRIMARY KEY,
    entity_type     enum_entity_type NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

GRANT INSERT, SELECT ON entities TO saveup_www;
SELECT create_reference_table('entities');