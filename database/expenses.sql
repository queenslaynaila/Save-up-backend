-- Table: Expenses
CREATE TABLE IF NOT EXISTS expenses (
  entity_id      INT NOT NULL,
  id             INT NOT NULL,
  category_id    INT NOT NULL,
  expense_name   TEXT NOT NULL,
  description    TEXT,
  amount_spent   NUMERIC(30, 2) NOT NULL CHECK (amount_spent >= 0),
  date_spent     TIMESTAMP WITH TIME ZONE, 
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at     TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY    (entity_id, id),
  FOREIGN KEY    (entity_id) REFERENCES entities(id),
  FOREIGN KEY    (category_id) REFERENCES categories(id)
);

GRANT INSERT, SELECT, UPDATE ON expenses TO app_user;
CREATE INDEX idx_expenses_by_entity_id ON expenses(entity_id);
SELECT create_distributed_table('expenses', 'entity_id');  -- As expenses is frequently accesed by entity id