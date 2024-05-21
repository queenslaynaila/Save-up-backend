CREATE TYPE enum_transaction_type AS ENUM ('Saving', 'External Saving', 'Withdrawal', 'Transfer In', 'Transfer Out', 'Interest');

CREATE TABLE IF NOT EXISTS transaction_logs (
  entity_id               INT NOT NULL,
  pocket_id               INT NOT NULL,
  xid                     INT NOT NULL,
  transaction_type        enum_transaction_type NOT NULL,
  amount                  NUMERIC(30, 2) NOT NULL CHECK (amount > 0),
  cumulative_amount       NUMERIC(30, 2) NOT NULL CHECK (cumulative_amount >= 0),
  reference_no            TEXT NOT NULL, -- The bank or mobile transaction no
  created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY             (entity_id, pocket_id, xid),
  FOREIGN KEY             (entity_id, pocket_id) REFERENCES pockets (entity_id, xid)
);

GRANT INSERT, SELECT ON transaction_logs TO app_user;
SELECT create_distributed_table('transaction_logs', 'entity_id');