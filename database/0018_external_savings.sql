CREATE TABLE IF NOT EXISTS external_savings (
  id                    INT NOT NULL, 
  pocket_id             INT NOT NULL,
  amount                NUMERIC(30, 2) NOT NULL,
  show_details          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY           (pocket_id, id), 
  FOREIGN KEY           (id) REFERENCES entities(id),
  FOREIGN KEY           (id, pocket_id) REFERENCES pockets (entity_id, xid)
);

GRANT INSERT, SELECT ON external_savings TO app_user;
CREATE INDEX idx_external_savings_by_pocket_id ON external_savings(pocket_id);
SELECT create_distributed_table('external_savings', 'pocket_id');