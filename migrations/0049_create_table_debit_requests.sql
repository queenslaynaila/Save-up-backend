DO $$
BEGIN
   CREATE TYPE enum_approval_status AS ENUM (
       'Pending Guarantors',   
       'Pending Admin Approval',   
       'Pending',
       'Approved',  
       'Rejected', 
       'Cancelled'
   );
EXCEPTION
  WHEN DUPLICATE_OBJECT THEN NULL;
END
$$;

DO $$
BEGIN
   CREATE TYPE enum_debit_type AS ENUM ('Loan', 'Withdrawal');
EXCEPTION
  WHEN DUPLICATE_OBJECT THEN NULL;
END
$$;

CREATE TABLE IF NOT EXISTS debit_requests (
    group_id              INT NOT NULL,
    xid                   INT NOT NULL,
    initiator_id          INT NOT NULL,
    debit_type            enum_debit_type,
    pocket_id             INT NOT NULL,
    amount                NUMERIC(30, 2) NOT NULL CHECK (amount > 0),
    reason                TEXT NOT NULL,
    status                enum_approval_status NOT NULL,
    created_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY           (group_id, xid),
    FOREIGN KEY           (group_id, initiator_id) REFERENCES group_members (group_id, user_id),
    FOREIGN KEY           (group_id, pocket_id) REFERENCES pockets (group_id, xid)
);
GRANT INSERT, SELECT ON debit_requests TO saveup_www;
SELECT create_distributed_table('debit_requests', 'group_id');

CREATE TABLE IF NOT EXISTS loan_requests (
    group_id          INT NOT NULL,
    request_id        INT NOT NULL,
    repayment_period  INTERVAL NOT NULL,
    PRIMARY KEY       (group_id, request_id),
    FOREIGN KEY       (group_id, request_id) REFERENCES debit_requests (group_id, xid)
);
GRANT INSERT, SELECT ON loan_requests TO saveup_www;
SELECT create_distributed_table('loan_requests', 'group_id');

CREATE TABLE IF NOT EXISTS loan_guarantors (
    group_id          INT NOT NULL,
    request_id        INT NOT NULL,
    guarantor_id      INT NOT NULL,
    PRIMARY KEY       (group_id, request_id, guarantor_id),
    FOREIGN KEY       (group_id, request_id) REFERENCES debit_requests (group_id, xid),
    FOREIGN KEY       (group_id, guarantor_id) REFERENCES group_members (group_id, user_id)
);
GRANT INSERT, SELECT ON loan_guarantors TO saveup_www;
SELECT create_distributed_table('loan_guarantors', 'group_id');

CREATE TABLE IF NOT EXISTS guarantor_approvals (
    group_id         INT NOT NULL,
    request_id       INT NOT NULL,
    guarantor_id     INT NOT NULL,
    approval         BOOLEAN NOT NULL,
    created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY      (group_id, request_id, guarantor_id),
    FOREIGN KEY      (group_id, request_id, guarantor_id) REFERENCES loan_guarantors (group_id, request_id, guarantor_id)
);
GRANT INSERT, SELECT ON guarantor_approvals TO saveup_www;
SELECT create_distributed_table('guarantor_approvals', 'group_id');

CREATE TABLE IF NOT EXISTS withdrawal_recipients (
    group_id          INT NOT NULL,
    request_id        INT NOT NULL,
    user_id           INT NOT NULL,
    amount            NUMERIC(30, 2) NOT NULL CHECK (amount > 0),
    PRIMARY KEY       (group_id, request_id, user_id),
    FOREIGN KEY       (group_id, request_id) REFERENCES debit_requests (group_id, xid),
    FOREIGN KEY       (group_id, user_id) REFERENCES group_members (group_id, user_id)
);
GRANT INSERT, SELECT ON withdrawal_recipients TO saveup_www;
SELECT create_distributed_table('withdrawal_recipients', 'group_id');

CREATE TABLE IF NOT EXISTS debit_approvals (
    group_id              INT NOT NULL,
    request_id            INT NOT NULL,
    admin_id              INT NOT NULL,
    election_id           INT NOT NULL,
    status                enum_approval_status NOT NULL,
    reason                TEXT NOT NULL,
    created_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY           (group_id, request_id, admin_id),
    FOREIGN KEY           (group_id, election_id, admin_id) REFERENCES group_admins (group_id, election_id, user_id),
    FOREIGN KEY           (group_id, request_id) REFERENCES debit_requests (group_id, xid)
);
GRANT INSERT, SELECT ON debit_approvals TO saveup_www;
SELECT create_distributed_table('debit_approvals', 'group_id');


CREATE TABLE IF NOT EXISTS group_debit_disbursements (
    group_id              INT NOT NULL,
    transaction_id        INT NOT NULL,
    request_id            INT NOT NULL,
    recipient_id          INT NOT NULL,
    created_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY           (group_id, transaction_id),
    FOREIGN KEY           (group_id, request_id) REFERENCES debit_requests (group_id, xid),
    FOREIGN KEY           (group_id, transaction_id) REFERENCES transactions (group_id, xid),
    FOREIGN KEY           (group_id, recipient_id) REFERENCES group_members (group_id, user_id)
);
GRANT INSERT, SELECT ON group_debit_disbursements TO saveup_www;
SELECT create_distributed_table('group_debit_disbursements', 'group_id');
