-- Each nominator can only nominate one mbr for a specific election within a group.
-- A nominee can be nominated more than once for a specific election within a group.
-- 3 top most Nominess with the most nominations per grp election are approinted admins

CREATE TABLE IF NOT EXISTS nominated_administrators (
  group_id           INT NOT NULL,
  election_id        INT NOT NULL,
  nominee_id         INT NOT NULL,
  nominator_id       INT NOT NULL,
  created_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  revoked_at         TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY        (group_id, election_id,nominator_id),
  FOREIGN KEY        (group_id, election_id) REFERENCES elections(group_id, xid)
);

SELECT create_distributed_table('nominated_administrators', 'group_id');

CREATE UNIQUE INDEX nominated_administrators_group_id_nominee_id_key 
ON nominated_administrators(group_id, nominee_id) 
WHERE revoked_at  IS NULL;

GRANT SELECT, INSERT ON nominated_administrators TO app_user;       