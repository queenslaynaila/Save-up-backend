CREATE TYPE enum_exit_reason AS ENUM ('
 Self removal', 
 'Admin removal', 
 'Rule violation', 
 'Other'
);

CREATE TABLE IF NOT EXISTS group_members (
  group_id      INT NOT NULL,
  user_id       INT NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY   (group_id, user_id),
  FOREIGN KEY   (group_id) REFERENCES groups(id) ON DELETE RESTRICT ON UPDATE RESTRICT
);
SELECT create_distributed_table('group_members', 'group_id');
GRANT INSERT, SELECT, UPDATE ON group_members TO app_user;

CREATE TABLE IF NOT EXISTS group_joins (
  group_id      INT NOT NULL,
  user_id       INT NOT NULL,
  xid           INT NOT NULL,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY   (group_id, user_id, xid),
  FOREIGN KEY   (group_id, user_id) REFERENCES group_members(group_id, user_id)
);
SELECT create_distributed_table('group_joins', 'group_id');
GRANT INSERT, SELECT ON group_joins TO app_user;

CREATE TABLE IF NOT EXISTS group_lefts(
  group_id      INT NOT NULL,
  user_id       INT NOT NULL,
  xid           INT NOT NULL,
  reason        enum_exit_reason NOT NULL,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY   (group_id, user_id, xid),
  FOREIGN KEY   (group_id, user_id) REFERENCES group_members(group_id, user_id)
);
SELECT create_distributed_table('group_lefts', 'group_id');
GRANT INSERT, SELECT ON group_lefts TO app_user;