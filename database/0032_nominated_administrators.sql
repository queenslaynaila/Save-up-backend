CREATE TABLE IF NOT EXISTS nominated_administrators (
  group_id           INT NOT NULL,
  xid                INT NOT NULL,
  nominee_id         INT NOT NULL,
  nominator_id       INT NOT NULL,
  election_id        INT NOT NULL,
  created_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  revoked_at         TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY        (group_id, x_id),
  FOREIGN KEY        (group_id, nominator_id) REFERENCES group_users(group_id, user_id),
  FOREIGN KEY        (group_id, nominee_id) REFERENCES group_users(group_id, user_id),
  FOREIGN KEY        (group_id, election_id) REFERENCES elections(group_id, xid)
);

SELECT create_distributed_table('nominated_administrators', 'group_id');

CREATE UNIQUE INDEX nominated_administrators_group_id_nominee_id_key 
ON nominated_administrators(group_id, nominee_id) 
WHERE revoked_at  IS NULL;

GRANT SELECT, INSERT ON nominated_administrators TO app_user;