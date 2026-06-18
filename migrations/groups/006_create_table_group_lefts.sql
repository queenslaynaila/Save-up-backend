CREATE TABLE IF NOT EXISTS group_lefts (
  group_id   uuid7       NOT NULL,
  user_id    uuid7       NOT NULL,
  -- The admin_id is the user who performed the removal, it can be the same as user_id if the user left by themselves
  admin_id   uuid7       NOT NULL,
  xid        INT         NOT NULL,
  reason     TEXT        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id, xid),
  FOREIGN KEY (group_id, user_id) REFERENCES group_members (group_id, user_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  FOREIGN KEY (group_id, admin_id) REFERENCES group_members (group_id, user_id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

SELECT create_distributed_table('group_lefts', 'group_id');
GRANT INSERT, SELECT ON group_lefts TO saveup_www;
