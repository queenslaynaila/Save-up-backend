CREATE TABLE IF NOT EXISTS pocket_reminders ( 
  entity_id               INT NOT NULL, 
  pocket_id               INT NOT NULL,
  reminder_count          INT NOT NULL DEFAULT 0,
  last_sent_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY             (entity_id, id), 
  FOREIGN KEY             (entity_id, id) REFERENCES pockets(entity_id, id)
);

GRANT INSERT, SELECT, UPDATE ON pockets TO app_user;
SELECT create_distributed_table('pocket_reminders', 'pocket_id');
