DO $$
BEGIN
  CREATE TYPE enum_token_reason AS ENUM (
    'Reset', 
    'Update', 
    'Unlock'
  );
EXCEPTION
  WHEN DUPLICATE_OBJECT THEN NULL;
END
$$;

CREATE TABLE IF NOT EXISTS reset_tokens (
  user_id       INT NOT NULL,
  xid           INT NOT NULL,
  token         TEXT NOT NULL,
  reason        enum_token_reason NOT NULL,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at       TIMESTAMP WITH TIME ZONE,
  expired_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '15 minutes',
  PRIMARY KEY   (user_id, xid),
  FOREIGN KEY   (user_id) REFERENCES users(id)
);

GRANT INSERT, SELECT, UPDATE ON reset_tokens TO saveup_www; 
SELECT create_distributed_table('reset_tokens', 'user_id');