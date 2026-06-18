-- todo: this can easily be stored as a boolean is_locked.
--  Alternatively,
--  we might consider a more flexible column lock_duration that specifies how long the pocket is locked for in months.
CREATE TYPE enum_pocket_type AS ENUM ('standard', 'locked');

CREATE TYPE enum_priority AS ENUM ('high', 'intermediate', 'low');

-- todo: what other statuses do we need? maybe 'paused' or 'cancelled'?
CREATE TYPE enum_status AS ENUM ('in-progress', 'completed');

CREATE TABLE IF NOT EXISTS pockets (
  user_id       uuid7            NOT NULL,
  wallet_id     uuid7            NOT NULL,
  category_id   INT              NOT NULL,
  name          TEXT,
  pocket_type   enum_pocket_type NOT NULL DEFAULT 'Standard',
  priority      enum_priority    NOT NULL DEFAULT 'Intermediate',
  status        enum_status      NOT NULL DEFAULT 'In Progress',
  target_amount NUMERIC(30, 2)   NOT NULL DEFAULT 0,
  target_at     timestamptz CHECK (target_at > NOW()),
  completed_at  timestamptz,
  deleted_at    timestamptz,
  PRIMARY KEY (user_id, wallet_id),
  FOREIGN KEY (user_id) REFERENCES users ON DELETE RESTRICT ON UPDATE RESTRICT,
  FOREIGN KEY (category_id) REFERENCES categories ON DELETE RESTRICT ON UPDATE RESTRICT,
  FOREIGN KEY (user_id, wallet_id) REFERENCES wallets ON DELETE RESTRICT ON UPDATE RESTRICT
);

SELECT create_distributed_table('pockets', 'user_id');

GRANT INSERT, SELECT, UPDATE ON pockets TO saveup_www;
