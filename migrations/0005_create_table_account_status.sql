CREATE TABLE IF NOT EXISTS account_status_updates (
  user_id         INT NOT NULL,
  xid             INT NOT NULL,
  admin_id        INT NOT NULL,
  status          enum_user_status NOT NULL,
  reason          TEXT,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  FOREIGN KEY     (user_id) REFERENCES users(id)
);
GRANT INSERT, SELECT ON account_status_updates TO saveup_www;
SELECT create_distributed_table('account_status_updates', 'user_id');