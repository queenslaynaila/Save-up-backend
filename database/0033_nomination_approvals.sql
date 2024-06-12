CREATE TABLE IF NOT EXISTS nomination_approvals (
  group_id              INT NOT NULL,
  xid                   INT NOT NULL,
  voter_id              INT NOT NULL,
  nominee_id            INT NOT NULL,
  vote                  BOOLEAN NOT NULL, 
  revoked_at            TIMESTAMP WITH TIME ZONE,
  created_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY           (group_id, xid),
  FOREIGN KEY           (group_id, voter_id) REFERENCES group_users(group_id, user_id),
  FOREIGN KEY           (group_id, nominee_id) REFERENCES nominated_administrators(group_id, user_id)
);

GRANT SELECT, INSERT ON nomination_approvals TO app_user;
SELECT create_distributed_table('nomination_approvals', 'group_id');

CREATE TABLE IF NOT EXISTS nominated_administrators (
  group_id           INT NOT NULL,
  xid                INT NOT NULL,
  user_id            INT NOT NULL,
  created_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  revoked_at         TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY        (group_id, xid),
  FOREIGN KEY        (group_id, user_id) REFERENCES group_users(group_id, user_id)
);
