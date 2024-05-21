-- Set Citus to run commands sequentially within this transaction
-- to avoid parallel DDL error due to default pkts -pkts - category rlshp
SET LOCAL citus.multi_shard_modify_mode TO 'sequential';

CREATE TABLE IF NOT EXISTS default_pockets ( 
  entity_id               INT PRIMARY KEY, 
  pocket_id               INT NOT NULL,
  FOREIGN KEY             (entity_id, pocket_id) REFERENCES pockets(entity_id, xid)
);

--Reset Citus to its default behaviour
RESET citus.multi_shard_modify_mode;

GRANT INSERT, SELECT ON pockets TO app_user;
SELECT create_distributed_table('default_pockets', 'entity_id');