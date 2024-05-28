CREATE TABLE IF NOT EXISTS savings (
  entity_id             INT NOT NULL, 
  xid                   INT NOT NULL,
  pocket_id             INT NOT NULL,
  user_id               INT NOT NULL, 
  amount                NUMERIC(30, 2) NOT NULL CHECK (amount > 0),
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY           (entity_id, xid),
  FOREIGN KEY           (entity_id, pocket_id) REFERENCES pockets (entity_id, xid),
  FOREIGN KEY           (user_id) REFERENCES entities (id)
);

SELECT create_distributed_table('savings', 'entity_id');
GRANT INSERT, SELECT ON savings TO app_user;