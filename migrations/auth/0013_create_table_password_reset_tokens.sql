CREATE TABLE IF NOT EXISTS password_reset_tokens (
  phone      phone_number PRIMARY KEY,
  token      TEXT        NOT NULL,
  expires_at timestamptz NOT NULL,
  attempts   INT         NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON password_reset_tokens TO saveup_www;

SELECT create_distributed_table('password_reset_tokens', 'phone');
