CREATE TABLE IF NOT EXISTS external_savings (
  entity_id             INT NOT NULL, -- owner of the pocket
  xid                   INT NOT NULL,
  pocket_id             INT NOT NULL, -- the pocket itself      
  donor_id              INT NOT NULL, -- the donor depositing the cash as some sort of donation,                                                                                                                                                     
  amount                NUMERIC(30, 2) NOT NULL CHECK (amount > 0),
  show_details          BOOLEAN NOT NULL DEFAULT TRUE, 
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY           (entity_id, xid),
  FOREIGN KEY           (entity_id, pocket_id) REFERENCES pockets (entity_id, xid)
);
SELECT create_distributed_table('external_savings', 'entity_id');
GRANT INSERT, SELECT ON external_savings TO saveup_www;
