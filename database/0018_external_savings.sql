CREATE TABLE IF NOT EXISTS external_savings (
  entity_id             INT NOT NULL,
  xid                   INT NOT NULL,
  pocket_id             INT NOT NULL, 
  amount                NUMERIC(30, 2) NOT NULL,
  show_details          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY           (entity_id, xid),
  FOREIGN KEY           (entity_id, pocket_id) REFERENCES pockets (entity_id, xid)
);

GRANT INSERT, SELECT ON external_savings TO app_user;
SELECT create_distributed_table('external_savings', 'entity_id');