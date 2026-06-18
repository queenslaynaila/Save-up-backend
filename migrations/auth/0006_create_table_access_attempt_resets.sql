CREATE TYPE attempt_type AS ENUM ('login', 'password_reset');

CREATE TABLE IF NOT EXISTS access_attempt_resets (
  phone      phone_number NOT NULL,
  xid        uuid7        NOT NULL DEFAULT uuidv7(),
  admin_id   uuid7        NOT NULL REFERENCES user_identities ON DELETE RESTRICT ON UPDATE RESTRICT,
  type       attempt_type NOT NULL,
  reason     TEXT,
  created_at timestamptz  NOT NULL DEFAULT NOW(),
  PRIMARY KEY (phone, xid)
);

GRANT INSERT, SELECT ON access_attempt_resets TO saveup_www;

SELECT create_distributed_table('access_attempt_resets', 'phone');
