CREATE TYPE enum_exit_reason AS ENUM (
 'Self removal', 'Admin removal'
);

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