CREATE TABLE IF NOT EXISTS withdrawals (
  pocket_id     INT NOT NULL,
  xid           INT NOT NULL,
  entity_id     INT NOT NULL,
  user_id       INT NOT NULL, 
  amount        NUMERIC(30, 2) NOT NULL CHECK (amount >= 0),
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY   (pocket_id, xid),
  FOREIGN KEY   (entity_id, pocket_id) REFERENCES pockets (entity_id, xid),
  FOREIGN KEY   (user_id) REFERENCES users(id)
);

GRANT INSERT, SELECT ON withdrawals TO app_user;