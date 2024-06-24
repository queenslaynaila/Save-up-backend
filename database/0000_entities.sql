CREATE TYPE enum_entity_type AS ENUM ('User', 'Group', 'Donor');

CREATE TABLE IF NOT EXISTS entities (
  id              SERIAL PRIMARY KEY,
  entity_type     enum_entity_type NOT NULL, 
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
SELECT create_reference_table('entities');
GRANT INSERT, SELECT ON entities TO app_user;  