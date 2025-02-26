CREATE TABLE IF NOT EXISTS groups (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  creator_id    INT NOT NULL, 
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY   (creator_id) REFERENCES entities(id)
);
SELECT create_distributed_table('groups', 'id');
GRANT INSERT, SELECT, UPDATE ON groups TO saveup_www;