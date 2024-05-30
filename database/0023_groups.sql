CREATE TABLE IF NOT EXISTS groups (
  id            INT NOT NULL PRIMARY KEY,
  name          TEXT NOT NULL,
  created_by    INT NOT NULL, 
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY   (id) REFERENCES entities(id),
  FOREIGN KEY   (created_by) REFERENCES entities(id)
);
SELECT create_distributed_table('groups', 'id');
GRANT INSERT, SELECT, UPDATE ON groups TO app_user;