-- Create the 'savings' table without the distributed 
-- pockets foreign key constraint as citus 
-- doesnt allow a normal psql table to ref a distributed table
-- Distribute table by user id
-- Use alter command to add the fk constaint thereby bypasing citus
CREATE TABLE IF NOT EXISTS savings (
  entity_id             INT NOT NULL, 
  xid                   INT NOT NULL,
  pocket_id             INT NOT NULL,
  user_id               INT NOT NULL, 
  amount                NUMERIC(30, 2) NOT NULL CHECK (amount > 0),
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY           (entity_id, xid)
);
SELECT create_distributed_table('savings', 'entity_id');

ALTER TABLE savings
ADD CONSTRAINT fk_pocket_id
FOREIGN KEY (entity_id, pocket_id) REFERENCES pockets (entity_id, xid);

ALTER TABLE savings
ADD CONSTRAINT fk_user_id
FOREIGN KEY (user_id) REFERENCES entities (id);

GRANT INSERT, SELECT ON savings TO app_user;