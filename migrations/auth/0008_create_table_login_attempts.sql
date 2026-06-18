CREATE TYPE login_error AS ENUM (
  'account_not_found',
  'account_not_active',
  'too_many_attempts',
  'wrong_password',
  'unknown'
  );

CREATE TABLE IF NOT EXISTS login_attempts (
  phone         phone_number NOT NULL,
  ip            TEXT         NOT NULL,
  user_agent_id INT          NOT NULL REFERENCES user_agents ON DELETE RESTRICT ON UPDATE RESTRICT,
  error         login_error,
  created_at    timestamptz  NOT NULL DEFAULT NOW()
);

SELECT create_distributed_table('login_attempts', 'phone');

GRANT INSERT, SELECT ON login_attempts TO saveup_www;


