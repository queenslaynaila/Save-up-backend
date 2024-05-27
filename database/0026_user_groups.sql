CREATE TABLE IF NOT EXISTS user_groups (
  group_id      INT NOT NULL,
  user_id       INT NOT NULL,
  joined_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  left_at       TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY   (group_id,user_id),
  FOREIGN KEY   (group_id) REFERENCES groups(id),
  FOREIGN KEY   (user_id) REFERENCES entities (id);
);
GRANT INSERT, SELECT, UPDATE ON user_groups TO app_user;
SELECT create_distributed_table('user_groups', 'group_id');