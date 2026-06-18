CREATE TYPE entity_type AS ENUM ('user', 'group');

CREATE TABLE IF NOT EXISTS entities (
  id         uuid7 PRIMARY KEY    DEFAULT uuidv7(),
  type       entity_type NOT NULL,
  name       TEXT        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

-- Grant permissions
GRANT SELECT, INSERT ON TABLE entities TO saveup_www;

-- Citus specific
SELECT create_distributed_table('entities', 'id');
