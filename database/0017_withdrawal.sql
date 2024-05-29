-- Step 1: Create the table with a foreign key reference to a reference table only.
-- Isolate the step to ensure that the table is created before any distribution logic is applied.
-- On creation the table is a local table and  As Citus can't enforce foreign key constraints from local to 
-- both a  distributed and reference tables within the same transaction.
-- Add the other foreign key in a separate transaction after distribution.

CREATE TABLE IF NOT EXISTS withdrawals (
  entity_id     INT NOT NULL,
  xid           INT NOT NULL,
  pocket_id     INT NOT NULL,
  user_id       INT NOT NULL, 
  amount        NUMERIC(30, 2) NOT NULL CHECK (amount >= 0),
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY   (entity_id, xid),
  FOREIGN KEY   (user_id) REFERENCES entities(id)
);

SELECT create_distributed_table('withdrawals', 'entity_id');
GRANT INSERT, SELECT ON withdrawals TO app_user;

ALTER TABLE withdrawals
ADD CONSTRAINT fk_pockets
FOREIGN KEY (entity_id, pocket_id) REFERENCES pockets (entity_id, xid);