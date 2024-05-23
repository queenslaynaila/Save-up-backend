CREATE TYPE enum_transaction_type AS ENUM ('Saving', 'External Saving', 'Withdrawal', 'Transfer In', 'Transfer Out', 'Interest');
CREATE TYPE enum_transaction_type AS ENUM ('Succesful', 'Pending');


CREATE TABLE IF NOT EXISTS transaction_logs (
  entity_id               INT NOT NULL, -- rhe client himself
  pocket_id               INT NOT NULL, -- theaccount no of the clienr 
  xid                     INT NOT NULL,
  transaction_type        enum_transaction_type NOT NULL,
  amount                  NUMERIC(30, 2) NOT NULL CHECK (amount > 0),
  reference_no            TEXT NOT NULL, -- The bank or mobile transaction no
  status                  TEXT NOT NULL DEFAULT 'Pending', -- The bank or mobile transaction no
  cumulative_amount       NUMERIC(30, 2) NOT NULL CHECK (cumulative_amount >= 0) --curent accoyt balance,
  created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY             (entity_id, pocket_id, xid),
  FOREIGN KEY             (entity_id, pocket_id) REFERENCES pockets (entity_id, xid)
);

GRANT INSERT, SELECT ON transaction_logs TO app_user;
SELECT create_distributed_table('transaction_logs', 'entity_id');