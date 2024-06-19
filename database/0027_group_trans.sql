CREATE TABLE IF NOT EXISTS group_withdrawal_approvals (
  group_id      INT NOT NULL,
  xid           INT NOT NULL,
  admin_id      INT NOT NULL,
  election_id   INT NOT NULL,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL,
  PRIMARY KEY   (group_id, xid, admin_id),
  FOREIGN KEY   (group_id, election_id, admin_id) REFERENCES group_admins (group_id, election_id, user_id),
  FOREIGN KEY   (group_id, xid) REFERENCES withdrawals (group_id, withdrawal_id)
);

CREATE TABLE IF NOT EXISTS group_withdrawals (
  group_id      INT NOT NULL,
  withdrawal_id   INT NOT NULL,
  election_id       INT NOT NULL,
  initiator_id       INT NOT NULL,
  reason        TEXT NOT NULL,
  status        TEXT NOT NULL,
  PRIMARY KEY   (group_id, election_id, user_id),
  FOREIGN KEY   (group_id, election_id, user_id) REFERENCES candidates (group_id, election_id, candidate_id)
);



CREATE TABLE IF NOT EXISTS group_deposits (
  group_id      INT NOT NULL,
  election_id   INT NOT NULL,
  user_id       INT NOT NULL,
  PRIMARY KEY   (group_id, election_id, user_id),
  FOREIGN KEY   (group_id, election_id, user_id) REFERENCES candidates (group_id, election_id, candidate_id)
);


