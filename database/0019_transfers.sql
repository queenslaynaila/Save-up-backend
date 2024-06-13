-- Step 1: Create the table with a foreign key reference to a reference table only.
-- Isolate the step to ensure that the table is created before any distribution logic is applied.
-- On creation the table is a local table and  As Citus can't enforce foreign key constraints from local to 
-- both a  distributed and reference tables within the same transaction.
-- Add the other foreign key in a separate transaction after distribution.

CREATE TABLE IF NOT EXISTS transfers (
  entity_id               INT NOT NULL,  --owner of pkt, user or group
  xid                     INT NOT NULL,
  user_id                 INT NOT NULL,  --user doing transfer, a user or grp member
  source_pocket_id        INT NOT NULL,
  destination_pocket_id   INT NOT NULL,
  amount                  NUMERIC(30, 2) NOT NULL CHECK (amount > 0),
  created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY             (entity_id, xid),
  FOREIGN KEY             (entity_id, source_pocket_id) REFERENCES pockets(entity_id, xid),
  FOREIGN KEY             (entity_id, destination_pocket_id) REFERENCES pockets(entity_id, xid)
);

GRANT INSERT, SELECT ON transfers TO app_user;
SELECT create_distributed_table('transfers', 'entity_id');

ALTER TABLE  transfers
ADD CONSTRAINT transfers_user_id_fkey
FOREIGN KEY (user_id) REFERENCES entities(id);