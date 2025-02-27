CREATE TABLE IF NOT EXISTS donors (
  id                   INT NOT NULL PRIMARY KEY,
  full_name            TEXT NOT NULL,
  phone_number         TEXT NOT NULL,
  created_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY          (id) REFERENCES entities(id)
);
SELECT create_distributed_table('donors', 'id'); 
GRANT INSERT, SELECT, UPDATE ON donors TO saveup_www; 