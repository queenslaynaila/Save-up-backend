-- TODO: Update to follow the same structure as user_audit_logs table
CREATE TABLE IF NOT EXISTS prev_group_names (
  group_id   INT                      NOT NULL,
  xid        INT                      NOT NULL,
  name       TEXT                     NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  PRIMARY KEY (group_id, xid),
  FOREIGN KEY (group_id) REFERENCES groups (id)
);

SELECT create_distributed_table('prev_group_names', 'group_id');
GRANT INSERT, SELECT ON prev_group_names TO saveup_www;
