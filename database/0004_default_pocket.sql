
CREATE TABLE IF NOT EXISTS default_pockets ( 
  entity_id               INT NOT NULL, 
  pocket_id               INT NOT NULL,
  PRIMARY KEY             (entity_id, pocket_id), 
  FOREIGN KEY             (entity_id, pocket_id) REFERENCES pockets(entity_id, id)
);

GRANT INSERT, SELECT ON pockets TO app_user;
SELECT create_distributed_table('default_pockets', 'pocket_id');
