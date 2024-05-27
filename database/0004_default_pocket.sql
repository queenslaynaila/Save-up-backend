CREATE TABLE IF NOT EXISTS default_pockets ( 
  entity_id               INT PRIMARY KEY, 
  pocket_id               INT NOT NULL,
  FOREIGN KEY             (entity_id, pocket_id) REFERENCES pockets(entity_id, xid)
);

GRANT INSERT, SELECT ON pockets TO app_user;
SELECT create_distributed_table('default_pockets', 'entity_id');