CREATE TABLE IF NOT EXISTS reset_tokens (
  user_id       INT NOT NULL,
  ex_id         INT NOT NULL,
  token         TEXT NOT NULL,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at       TIMESTAMP WITH TIME ZONE,
  expired_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '15 minutes',
  PRIMARY KEY   (user_id, ex_id),
  FOREIGN KEY   (user_id) REFERENCES users(id)
);

GRANT INSERT, SELECT, UPDATE ON reset_tokens TO app_user; 
SELECT create_distributed_table('reset_tokens', 'user_id');