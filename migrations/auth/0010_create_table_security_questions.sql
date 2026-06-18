CREATE TABLE IF NOT EXISTS security_questions (
  id         SERIAL PRIMARY KEY,
  question   TEXT        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

SELECT create_reference_table('security_questions');

GRANT SELECT ON security_questions TO saveup_www;
GRANT USAGE ON security_questions_id_seq TO saveup_www;
