CREATE TYPE transaction_type AS ENUM (
  'deposit',
  'withdraw',
  'internal-transfer',
  'interest',
  'penalty',
  'loan',
  'repayment'
  );

CREATE TABLE IF NOT EXISTS transactions (
  entity_id    uuid7            NOT NULL,
  xid          INT              NOT NULL,
  PRIMARY KEY (entity_id, xid),
  FOREIGN KEY (entity_id) REFERENCES entities ON DELETE RESTRICT ON UPDATE RESTRICT,

  wallet_id    uuid7            NOT NULL,
  FOREIGN KEY (entity_id, wallet_id) REFERENCES wallets ON DELETE RESTRICT ON UPDATE RESTRICT,

  type         transaction_type NOT NULL,
  reference_id uuid7            NOT NULL,
  UNIQUE (entity_id, type, reference_id),

  delta        NUMERIC(30, 3)   NOT NULL CHECK ( delta <> 'NaN'::NUMERIC AND delta <> 0 ),
  balance      NUMERIC(30, 3)   NOT NULL CHECK ( balance <> 'NaN'::NUMERIC AND balance >= 0 ),
  created_at   timestamptz      NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS transactions_user_id_transaction_id_idx ON transactions (entity_id, wallet_id, xid);

-- Grant permissions
GRANT SELECT, INSERT ON TABLE transactions TO saveup_www;

-- Citus specific
SELECT create_distributed_table('transactions', 'entity_id');
