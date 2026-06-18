CREATE TABLE IF NOT EXISTS user_agents (
  id         SERIAL PRIMARY KEY,
  ua         TEXT        NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON user_agents TO saveup_www;
GRANT USAGE ON user_agents_id_seq TO saveup_www;

SELECT create_reference_table('user_agents');
