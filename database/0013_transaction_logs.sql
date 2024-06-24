CREATE TYPE enum_transaction_type AS ENUM (
  'Saving', 
  'ExternalSaving', 
  'Withdrawal', 
  'TransferIn', 
  'TransferOut', 
  'Interest'
);

CREATE TABLE IF NOT EXISTS transaction_types (
  id          SERIAL PRIMARY KEY,
  slug        enum_transaction_type NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
); 

CREATE TABLE IF NOT EXISTS transactions (
  entity_id               INT NOT NULL, 
  xid                     INT NOT NULL,
  type_id                 INT NOT NULL,
  pocket_id               INT NOT NULL,
  reference_id            INT NOT NULL,
  delta                   NUMERIC(30, 2) NOT NULL CHECK (delta > 0),
  balance                 NUMERIC(30, 2) NOT NULL CHECK (balance >= 0), 
  created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY             (entity_id, xid),
  FOREIGN KEY             (entity_id, pocket_id) REFERENCES pockets (entity_id, xid),
  FOREIGN KEY             (type_id) REFERENCES transaction_types(id)
);

GRANT INSERT, SELECT ON transactions TO app_user;
SELECT create_distributed_table('transactions', 'entity_id');