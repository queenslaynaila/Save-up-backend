CREATE TABLE IF NOT EXISTS transactions (
  entity_id               INT NOT NULL,
  xid                     INT NOT NULL,
  type_id                 INT NOT NULL,
  pocket_id               INT NOT NULL,
  reference_id            TEXT NOT NULL,
  delta                   NUMERIC(30, 2) NOT NULL,
  balance                 NUMERIC(30, 2) NOT NULL CHECK (balance >= 0),
  created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY             (entity_id, xid ),
  FOREIGN KEY             (type_id) REFERENCES transaction_types(id)
);

GRANT INSERT, SELECT ON transactions TO saveup_www;
SELECT create_distributed_table('transactions', 'entity_id');

ALTER TABLE transactions
ADD CONSTRAINT transactions_pocket_id_fkey
FOREIGN KEY  (entity_id, pocket_id) REFERENCES pockets (entity_id, xid);

