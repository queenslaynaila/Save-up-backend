SET LOCAL citus.multi_shard_modify_mode TO 'sequential';

CREATE TABLE IF NOT EXISTS pocket_type_history (
  entity_id             INT NOT NULL,
  pocket_id             INT NOT NULL,
  xid                   INT NOT NULL,
  pocket_type           enum_pocket_type NOT NULL,
  created_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY           (entity_id, pocket_id, xid), 
  FOREIGN KEY           (entity_id, pocket_id) REFERENCES pockets(entity_id, xid)
);

SELECT create_distributed_table('pocket_type_history', 'entity_id');
GRANT INSERT, SELECT ON pocket_type_history TO saveup_www;