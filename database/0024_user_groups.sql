CREATE TABLE IF NOT EXISTS group_users (
  group_id      INT NOT NULL,
  user_id       INT NOT NULL,
  joined_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  left_at       TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY   (group_id,user_id),
  FOREIGN KEY   (user_id) REFERENCES entities(id)
);

SELECT create_distributed_table('group_users', 'group_id');

ALTER TABLE group_users
ADD CONSTRAINT user_groups_group_id_fk
FOREIGN KEY (group_id) REFERENCES groups(id);

GRANT INSERT, SELECT, UPDATE ON group_users TO app_user;