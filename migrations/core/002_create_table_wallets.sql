CREATE TYPE wallet_type AS ENUM ('goal', 'donation', 'group');

CREATE TABLE IF NOT EXISTS wallets (
  entity_id  uuid7       NOT NULL,
  xid        uuid7       NOT NULL,
  PRIMARY KEY (entity_id, xid),
  FOREIGN KEY (entity_id) REFERENCES entities ON DELETE RESTRICT ON UPDATE RESTRICT,

  type       wallet_type NOT NULL,
  currency   TEXT        NOT NULL,

  -- this determines interest rate.
  -- Locked wallets vs Non-locked wallets.
  -- Locked wallets have higher interest rates, but users can't withdraw from them freely.
  is_locked  BOOLEAN     NOT NULL DEFAULT FALSE,

  created_at timestamptz NOT NULL DEFAULT NOW()
);

SELECT create_distributed_table('wallets', 'entity_id');

GRANT INSERT, SELECT, UPDATE ON wallets TO saveup_www;
