CREATE TABLE IF NOT EXISTS group_joins (
  group_id      uuid7       NOT NULL,
  invitation_id uuid7       NOT NULL,
  user_id       uuid7       NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT NOW(),
  PRIMARY KEY (group_id, invitation_id),
  FOREIGN KEY (group_id, invitation_id) REFERENCES group_invitations (group_id, xid) ON DELETE RESTRICT ON UPDATE RESTRICT,
  FOREIGN KEY (group_id, user_id) REFERENCES group_members (group_id, user_id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

SELECT create_distributed_table('group_joins', 'group_id');

GRANT INSERT, SELECT ON group_joins TO saveup_www;

