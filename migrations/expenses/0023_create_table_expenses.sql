-- NOT REVIEWED
-- This feature should not be available in the MVP
CREATE TABLE IF NOT EXISTS expenses (
  entity_id   uuid7          NOT NULL,
  xid         INT            NOT NULL,
  category_id INT            NOT NULL,
  description TEXT,
  amount      NUMERIC(30, 2) NOT NULL CHECK (amount > 0),
  spent_at    DATE,
  created_at  timestamptz    NOT NULL DEFAULT NOW(),
  deleted_at  timestamptz,
  PRIMARY KEY (entity_id, xid),
  FOREIGN KEY (entity_id) REFERENCES entities (id),
  FOREIGN KEY (category_id) REFERENCES categories (id)
);

SELECT create_distributed_table('expenses', 'entity_id');

GRANT INSERT, SELECT, UPDATE ON expenses TO saveup_www;
