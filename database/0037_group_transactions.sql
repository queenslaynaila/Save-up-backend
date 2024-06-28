CREATE TYPE enum_withdrawal_reason AS ENUM (
'MerryGoRound', 
'Equal Division', 
'Group Expenses', 
'Project Funding', 
'Member Support',
'Miscellaneous'
);

CREATE TYPE enum_approval_status AS ENUM ('Approved', 'Rejected', 'Pending');

CREATE TABLE IF NOT EXISTS group_deposits (
  group_id              INT NOT NULL, 
  deposit_id            INT NOT NULL,
  user_id               INT NOT NULL,
  PRIMARY KEY           (group_id, deposit_id),
  FOREIGN KEY           (group_id, deposit_id) REFERENCES transactions (entity_id, xid)
);
GRANT INSERT, SELECT ON group_deposits TO app_user;
SELECT create_distributed_table('group_deposits', 'group_id');

CREATE TABLE IF NOT EXISTS group_withdrawal_requests (
  group_id              INT NOT NULL, 
  xid                   INT NOT NULL,
  election_id           INT NOT NULL,
  initiator_id          INT NOT NULL,
  pocket_id             INT NOT NULL,
  amount                NUMERIC(30, 2) NOT NULL CHECK (amount > 0),
  reason                enum_withdrawal_reason NOT NULL,
  PRIMARY KEY           (group_id, withdrawal_id),
  FOREIGN KEY           (group_id, election_id, initiator_id) REFERENCES group_admins (group_id, election_id, user_id)
);
GRANT INSERT, SELECT ON group_withdrawals TO app_user;
SELECT create_distributed_table('group_withdrawals', 'group_id');

CREATE TABLE IF NOT EXISTS group_withdrawals_recipients (
  group_id              INT NOT NULL, 
  withdrawal_id         INT NOT NULL,
  user_id               INT NOT NULL,
  amount                NUMERIC(30, 2) NOT NULL CHECK (amount > 0),
  PRIMARY KEY           (group_id, withdrawal_id, user_id),
  FOREIGN KEY           (group_id, user_id) REFERENCES group_members (group_id, user_id),
  FOREIGN KEY           (group_id, withdrawal_id) REFERENCES group_withdrawals (group_id, xid)
);
GRANT INSERT, SELECT ON group_withdrawals_recipients TO app_user;
SELECT create_distributed_table('group_withdrawals_recipients', 'group_id');

CREATE TABLE IF NOT EXISTS group_withdrawals_approvals (
  group_id              INT NOT NULL, 
  withdrawal_id         INT NOT NULL,
  admin_id              INT NOT NULL,
  election_id           INT NOT NULL,
  status                enum_approval_status NOT NULL DEFAULT 'Pending',
  reason                TEXT NOT NULL,
  created_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY           (group_id, withdrawal_id, admin_id),
  FOREIGN KEY           (group_id, election_id, admin_id) REFERENCES group_admins (group_id, election_id, user_id),
  FOREIGN KEY           (group_id, withdrawal_id) REFERENCES group_withdrawals (group_id, withdrawal_id)
);
GRANT INSERT, SELECT ON  group_withdrawals_approvals TO app_user;
SELECT create_distributed_table('group_withdrawals_approvals', 'group_id');