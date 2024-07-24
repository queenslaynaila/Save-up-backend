CREATE TYPE enum_approval_status AS ENUM ('Pending', 'Complete', 'Denied');

CREATE TABLE IF NOT EXISTS loan_requests (
    group_id              INT NOT NULL,
    xid                   INT NOT NULL,
    borrower_id           INT NOT NULL,
    guarantor_id          INT NOT NULL,
    pocket_id             INT NOT NULL,
    amount                NUMERIC(30, 2) NOT NULL CHECK (amount > 0),
    purpose               TEXT NOT NULL,
    repayment_period      INTERVAL NOT NULL,
    approval_status       enum_approval_status DEFAULT 'Pending',
    created_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY           (group_id, xid),
    FOREIGN KEY           (group_id, borrower_id) REFERENCES group_members (group_id, user_id),
    FOREIGN KEY           (group_id, guarantor_id) REFERENCES group_members (group_id, user_id)
);
GRANT INSERT, SELECT ON loan_requests TO app_user;
SELECT create_distributed_table('loan_requests', 'group_id');

CREATE TABLE IF NOT EXISTS loan_guarantor_approvals (
    group_id         INT NOT NULL,
    request_id       INT NOT NULL,
    user_id          INT NOT NULL,
    approval         BOOLEAN NOT NULL,
    created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY      (group_id, request_id),
    FOREIGN KEY      (group_id, user_id) REFERENCES group_members (group_id, user_id),
    FOREIGN KEY      (group_id, request_id) REFERENCES loan_requests (group_id, xid)
);
GRANT INSERT, SELECT ON loan_guarantor_approvals TO app_user;
SELECT create_distributed_table ('loan_guarantor_approvals', 'group_id');

CREATE TABLE IF NOT EXISTS loan_admin_approvals (
    group_id              INT NOT NULL,
    request_id            INT NOT NULL,
    admin_id              INT NOT NULL,
    election_id           INT NOT NULL,
    status                enum_approval_status NOT NULL DEFAULT 'Pending',
    reason                TEXT NOT NULL,
    created_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY           (group_id, request_id, admin_id),
    FOREIGN KEY           (group_id, election_id, admin_id) REFERENCES group_admins (group_id, election_id, user_id),
    FOREIGN KEY           (group_id, request_id) REFERENCES loan_requests (group_id, xid)
);
GRANT INSERT, SELECT ON loan_admin_approvals  TO app_user;
SELECT create_distributed_table('loan_admin_approvals', 'group_id');

CREATE TABLE IF NOT EXISTS loan_repayments (
   group_id              INT NOT NULL,
   deposit_id            INT NOT NULL,
   user_id               INT NOT NULL,
   amount                NUMERIC(30, 2) NOT NULL CHECK (amount > 0),
   created_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
   PRIMARY KEY           (group_id, deposit_id),
   FOREIGN KEY           (group_id, deposit_id) REFERENCES transactions (entity_id, xid),
   FOREIGN KEY           (group_id, user_id) REFERENCES group_members (group_id, user_id)
);
GRANT INSERT, SELECT ON loan_repayments TO app_user;
SELECT create_distributed_table(' loan_repayments', 'group_id');