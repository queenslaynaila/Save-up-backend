CREATE TABLE IF NOT EXISTS pocket_reminders ( 
  entity_id               INT NOT NULL, 
  pocket_id               INT NOT NULL,
  reason                  TEXT,
  created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY             (entity_id, pocket_id), 
  FOREIGN KEY             (entity_id, pocket_id) REFERENCES pockets(entity_id, xid)
);

GRANT INSERT, SELECT, UPDATE ON pockets TO app_user;
SELECT create_distributed_table('pocket_reminders', 'entity_id');