CREATE TABLE IF NOT EXISTS group_messages(
  id         SERIAL PRIMARY KEY,
  group_id   INT NOT NULL REFERENCES groups,
  user_id    INT  NOT NULL REFERENCES users,
  message    TEXT NOT NULL,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);