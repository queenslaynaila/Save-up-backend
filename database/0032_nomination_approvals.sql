CREATE TABLE IF NOT EXISTS nomination_approvals (
  group_id              INT NOT NULL,
  xid                   INT NOT NULL
  voter_member_id       INT NOT NULL,
  nominated_member_id   INT NOT NULL,
  vote                  BOOLEAN NOT NULL, 
  revoked_at            TIMESTAMP WITH TIME ZONE,
  created_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY           (group_id, xid),
  FOREIGN KEY           (group_id, voter_member_id) REFERENCES group_users(group_id, user_id),
  FOREIGN KEY           (group_id, nominated_member_id) REFERENCES nominated_administrators(group_id, user_id)
);

GRANT SELECT, INSERT ON nomination_approvals TO app_user;
SELECT create_distributed_table('nomination_approvals', 'group_id');