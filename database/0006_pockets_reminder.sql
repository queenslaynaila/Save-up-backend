CREATE TABLE IF NOT EXISTS pocket_reminders ( 
  entity_id               INT PRIMARY KEY, 
  pocket_id               INT NOT NULL,
  reason                  TEXT,
  created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  FOREIGN KEY             (entity_id, pocket_id) REFERENCES pockets(entity_id, xid)
);

GRANT INSERT, SELECT, UPDATE ON pockets TO app_user;
SELECT create_distributed_table('pocket_reminders', 'entity_id');