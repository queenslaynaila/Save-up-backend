
CREATE TABLE IF NOT EXISTS nomination_approvals (
  group_id              INT NOT NULL,
  voter_id              INT NOT NULL,
  nominee_id            INT NOT NULL,
  election_id           INT NOT NULL,
  vote                  BOOLEAN NOT NULL, 
  revoked_at            TIMESTAMP WITH TIME ZONE,
  created_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY           (group_id, voter_id, nominee_id, election_id),
  FOREIGN KEY           (group_id, election_id) REFERENCES elections(group_id, xid)
);

CREATE UNIQUE INDEX nomination_approvals_voter_id_nominee_id_key
ON nomination_approvals(group_id, voter_id, nominee_id) 
WHERE revoked_at IS NULL;

GRANT SELECT, INSERT ON nomination_approvals TO app_user;
SELECT create_distributed_table('nomination_approvals', 'group_id');