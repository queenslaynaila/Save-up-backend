CREATE TABLE IF NOT EXISTS user_audit_logs (
  user_id    uuid7       NOT NULL REFERENCES users ON DELETE RESTRICT ON UPDATE RESTRICT,
  field      TEXT        NOT NULL,
  old_value  jsonb       NOT NULL,
  new_value  jsonb       NOT NULL,
  -- The user ID of the user/admin who made the change.
  -- This can be the same as user_id if the user is updating their own information,
  -- or it can be different if an admin is making changes on behalf of a user.
  -- References the user_identities (as opposed to users) due to data collocation
  admin_id   uuid7       NOT NULL REFERENCES user_identities ON DELETE RESTRICT ON UPDATE RESTRICT,
  reason     TEXT,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

GRANT INSERT, SELECT ON user_audit_logs TO saveup_www;

SELECT create_distributed_table('user_audit_logs', 'user_id');
