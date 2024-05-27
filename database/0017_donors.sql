CREATE TABLE IF NOT EXISTS donors (
  entity_id            INT NOT NULL PRIMARY KEY,
  full_name            TEXT NOT NULL,
  phone_number         TEXT NOT NULL UNIQUE,
  created_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY          (entity_id) REFERENCES entities(id)
);
SELECT create_distributed_table('donors', 'entity_id');