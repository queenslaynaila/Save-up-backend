CREATE TABLE IF NOT EXISTS withdrawals (
  pocket_id     INT NOT NULL,
  id            INT NOT NULL,
  entity_id     INT NOT NULL, --- Entity id of the user or group who owns the savings.
  user_id       INT NOT NULL, --- ID of the user or the group administrator who withdrew the money.
  amount        NUMERIC(30, 2) NOT NULL CHECK (amount >= 0),
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY   (pocket_id, id),
  FOREIGN KEY   (entity_id, pocket_id) REFERENCES pockets (entity_id, id),
  FOREIGN KEY   (user_id) REFERENCES users(id)
);


