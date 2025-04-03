CREATE TABLE IF NOT EXISTS candidates (
  group_id       INT NOT NULL,
  election_id    INT NOT NULL,
  candidate_id   INT NOT NULL,
  chosen_by      INT NOT NULL, -- User ID of the person who chose the candidate
  created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY    (group_id, election_id, candidate_id),
  FOREIGN KEY    (group_id, candidate_id) REFERENCES group_members(group_id,user_id),
  FOREIGN KEY    (group_id, chosen_by) REFERENCES group_members(group_id,user_id),
  FOREIGN KEY    (group_id, election_id) REFERENCES elections(group_id,xid) 
    ON DELETE RESTRICT ON UPDATE RESTRICT
);
SELECT create_distributed_table('candidates', 'group_id');
GRANT INSERT, SELECT ON candidates TO saveup_www;

