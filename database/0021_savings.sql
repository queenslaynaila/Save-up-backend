-- Create the 'savings' table without the distributed 
-- pockets foreign key constraint as citus 
-- doesnt allow a normal psql table to ref a distributed table
-- Distribute table by user id
-- Use alter command to add the fk constaint thereby bypasing citus

CREATE TABLE IF NOT EXISTS savings (
  pocket_id             INT NOT NULL,
  entity_id             INT NOT NULL, -- Entity ID of the user or group owning the savings.
  user_id               INT NOT NULL,  -- ID of the user making the saving. For personal pockets, it's the same as entity_id.
  --For group pockets, it represents the group member saving the money thus diff from entity_id. 
  amount                NUMERIC(30, 2) NOT NULL CHECK (amount_spent >0 AND NOT isnan(amount)),
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY           (entity_id, pocket_id)
);

ALTER TABLE savings
ADD CONSTRAINT fk_pocket_id
FOREIGN KEY (entity_id, pocket_id) REFERENCES pockets (entity_id, xid);

ALTER TABLE savings
ADD CONSTRAINT fk_user_id
FOREIGN KEY (user_id) REFERENCES users (id);

GRANT INSERT, SELECT ON savings TO app_user;
SELECT create_distributed_table('savings', 'pocket_id');