CREATE TYPE enum_transaction_type AS ENUM ('Saving', 'External Saving', 'Withdrawal', 'Transfer In', 'Transfer Out', 'Interest');

CREATE TABLE IF NOT EXISTS transaction_logs (
  transaction_id          INT NOT NULL,
  pocket_id               INT NOT NULL,
  entity_id               INT NOT NULL,-- The owner of the pocket
  transaction_type        enum_transaction_type NOT NULL,
  amount                  NUMERIC(30, 2) NOT NULL CHECK (amount > 0),
  cumulative_amount       NUMERIC(30, 2) NOT NULL CHECK (cumulative_amount >= 0), -- Rep current balance available in the pocket
  reference_no            TEXT NOT NULL, -- The bank or mobile transaction reference number
  created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY             (pocket_id, transaction_id),
  FOREIGN KEY             (entity_id, pocket_id) REFERENCES pockets (entity_id, id)
);

GRANT SELECT ON transaction_logs TO app_user;
SELECT create_distributed_table('transaction_logs', 'pocket_id');

