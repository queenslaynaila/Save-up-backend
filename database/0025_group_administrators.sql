CREATE TABLE IF NOT EXISTS group_admins (
  group_id      INT NOT NULL,
  election_id   INT NOT NULL,
  user_id       INT NOT NULL,
  PRIMARY KEY   (group_id, election_id, user_id),
  FOREIGN KEY   (group_id, election_id, user_id) REFERENCES candidates (group_id, election_id, candidate_id)
);

SELECT create_distributed_table('group_administrators', 'group_id');
GRANT INSERT, SELECT, UPDATE ON group_administrators TO app_user;