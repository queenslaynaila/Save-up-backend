-- Table: Expenses
CREATE TABLE IF NOT EXISTS expenses (
  entity_id      INT NOT NULL,
  ex_id          INT NOT NULL,
  category_id    INT NOT NULL,
  description    TEXT,
  amount         NUMERIC(30, 2) NOT NULL CHECK (amount_spent >= 0 AND NOT isnan(amount)),
  spent_at       TIMESTAMP WITH TIME ZONE, 
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at     TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY    (entity_id, ex_id),
  FOREIGN KEY    (entity_id) REFERENCES entities(id),
  FOREIGN KEY    (category_id) REFERENCES categories(id)
);

GRANT INSERT, SELECT, UPDATE ON expenses TO app_user;
SELECT create_distributed_table('expenses', 'entity_id');  -- As expenses is frequently accesed by entity id