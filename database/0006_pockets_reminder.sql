-- Set Citus to run commands sequentially within this transaction
-- to avoid parallel DDL error due to default pkts -defaultts - category rlshp
SET LOCAL citus.multi_shard_modify_mode TO 'sequential';

CREATE TABLE IF NOT EXISTS pocket_reminders ( 
  entity_id               INT PRIMARY KEY, 
  pocket_id               INT NOT NULL,
  reason                  TEXT,
  created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  FOREIGN KEY             (entity_id, pocket_id) REFERENCES pockets(entity_id, xid)
);

--Reset Citus to its default behaviour
RESET citus.multi_shard_modify_mode;

GRANT INSERT, SELECT, UPDATE ON pockets TO app_user;
SELECT create_distributed_table('pocket_reminders', 'entity_id');