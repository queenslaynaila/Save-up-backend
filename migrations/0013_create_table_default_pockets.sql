CREATE TABLE IF NOT EXISTS default_pockets ( 
  entity_id               INT PRIMARY KEY, 
  pocket_id               INT NOT NULL,
  FOREIGN KEY             (entity_id, pocket_id) REFERENCES pockets(entity_id, xid)
);

SELECT create_distributed_table('default_pockets', 'entity_id');
GRANT INSERT, SELECT ON default_pockets TO saveup_www;

SET citus.multi_shard_modify_mode TO 'parallel';