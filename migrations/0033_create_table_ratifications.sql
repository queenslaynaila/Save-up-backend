CREATE TABLE IF NOT EXISTS ratifications (
  group_id       INT NOT NULL,
  election_id    INT NOT NULL,
  user_id        INT NOT NULL,
  is_ratified    BOOLEAN NOT NULL,
  created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY    (group_id, election_id, user_id),
  FOREIGN KEY    (group_id,user_id) REFERENCES group_members(group_id,user_id) 
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  FOREIGN KEY    (group_id, election_id) REFERENCES elections(group_id,xid)
    ON DELETE RESTRICT ON UPDATE RESTRICT
);
SELECT create_distributed_table('ratifications', 'group_id');
GRANT INSERT, SELECT ON ratifications TO saveup_www;

