CREATE TABLE IF NOT EXISTS groups (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  creator_id    INT NOT NULL, 
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY   (creator_id) REFERENCES entities(id)
);
SELECT create_distributed_table('groups', 'id');
GRANT INSERT, SELECT, UPDATE ON groups TO app_user;

CREATE TABLE IF NOT EXISTS prev_group_names (
  group_id      INT NOT NULL,
  xid           INT NOT NULL,
  name          TEXT NOT NULL,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY   (group_id, xid),
  FOREIGN KEY   (group_id) REFERENCES groups(id)
);
SELECT create_distributed_table('prev_group_names', 'group_id');
GRANT INSERT, SELECT ON prev_group_names TO app_user;