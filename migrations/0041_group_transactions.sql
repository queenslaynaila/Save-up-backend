CREATE TYPE enum_approval_status AS ENUM ('Approved', 'Rejected', 'Pending');

CREATE TABLE IF NOT EXISTS group_deposits (
    group_id              INT NOT NULL,
    deposit_id            INT NOT NULL,
    user_id               INT NOT NULL,
    PRIMARY KEY           (group_id, deposit_id),
    FOREIGN KEY           (group_id, deposit_id) REFERENCES transactions (entity_id, xid),
    FOREIGN KEY           (group_id, user_id) REFERENCES group_members (group_id, user_id)
);
GRANT INSERT, SELECT ON group_deposits TO app_user;
SELECT create_distributed_table('group_deposits', 'group_id');

CREATE TABLE IF NOT EXISTS debit_types (
    id          SERIAL PRIMARY KEY,
    type        TEXT NOT NULL UNIQUE
);
INSERT INTO debit_types (type) VALUES ('Loan'), ('Withdrawal');
GRANT SELECT ON debit_types TO app_user;
SELECT create_reference_table('debit_types');

CREATE TABLE IF NOT EXISTS debit_requests (
    group_id              INT NOT NULL,
    xid                   INT NOT NULL,
    election_id           INT NOT NULL,
    initiator_id          INT NOT NULL,
    type_id               INT NOT NULL,
    pocket_id             INT NOT NULL,
    amount                NUMERIC(30, 2) NOT NULL CHECK (amount > 0),
    reason                TEXT NOT NULL,
    status                enum_approval_status NOT NULL DEFAULT 'Pending',
    created_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY           (group_id, xid),
    FOREIGN KEY           (group_id, initiator_id) REFERENCES group_members (group_id, user_id),
    FOREIGN KEY           (group_id, election_id) REFERENCES elections (group_id, xid),
    FOREIGN KEY           (type_id) REFERENCES debit_types (id)
);
GRANT INSERT, SELECT ON debit_requests TO app_user;
SELECT create_distributed_table('debit_requests', 'group_id');
ALTER TABLE debit_requests
ADD FOREIGN KEY (type_id) REFERENCES debit_types (id);

CREATE TABLE IF NOT EXISTS loan_details (
    group_id          INT NOT NULL,
    request_id        INT NOT NULL,
    guarantor_id      INT NOT NULL,
    repayment_period  INTERVAL NOT NULL,
    PRIMARY KEY       (group_id, request_id),
    FOREIGN KEY       (group_id, request_id) REFERENCES debit_requests (group_id, xid),
    FOREIGN KEY       (group_id, guarantor_id) REFERENCES group_members (group_id, user_id)
);
GRANT INSERT, SELECT ON loan_details TO app_user;
SELECT create_distributed_table('loan_details', 'group_id');

CREATE TABLE IF NOT EXISTS guarantor_approvals (
    group_id         INT NOT NULL,
    request_id       INT NOT NULL,
    guarantor_id     INT NOT NULL,
    approval         BOOLEAN NOT NULL,
    created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY      (group_id, request_id),
    FOREIGN KEY      (group_id, request_id) REFERENCES debit_requests (group_id, xid)
);
GRANT INSERT, SELECT ON guarantor_approvals TO app_user;
SELECT create_distributed_table ('guarantor_approvals', 'group_id');

CREATE TABLE IF NOT EXISTS debit_recipients (
    group_id          INT NOT NULL,
    request_id        INT NOT NULL,
    recipient_id      INT NOT NULL,
    amount            NUMERIC(30, 2) NOT NULL CHECK (amount > 0),
    PRIMARY KEY       (group_id, request_id, recipient_id),
    FOREIGN KEY       (group_id, request_id) REFERENCES debit_requests (group_id, xid),
    FOREIGN KEY       (group_id, recipient_id) REFERENCES group_members (group_id, user_id)
);
GRANT INSERT, SELECT ON debit_recipients TO app_user;
SELECT create_distributed_table('debit_recipients', 'group_id');

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
GRANT INSERT, SELECT ON debit_approvals TO app_user;
SELECT create_distributed_table('debit_approvals', 'group_id');

CREATE TABLE IF NOT EXISTS disbursements (
    group_id              INT NOT NULL,
    transaction_id        INT NOT NULL,
    request_id            INT NOT NULL,
    user_id               INT NOT NULL,
    created_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY           (group_id, transaction_id),
    FOREIGN KEY           (group_id, request_id) REFERENCES debit_requests (group_id, xid)
    --FOREIGN KEY           (user_id, transaction_id) REFERENCES transactions (entity_id, xid)
);
GRANT INSERT, SELECT ON disbursements TO app_user;
SELECT create_distributed_table('disbursements', 'group_id');

CREATE TABLE IF NOT EXISTS group_transfers (
    group_id                  INT NOT NULL,
    source_transaction_id     INT NOT NULL,  -- Reference to the transfer out
    destination_transaction_id INT NOT NULL,  -- Reference to the transfer in
    election_id               INT NOT NULL,
    admin_id                  INT NOT NULL,
    created_at                TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY               (group_id, source_transaction_id, destination_transaction_id),
    FOREIGN KEY               (group_id, admin_id) REFERENCES group_members (group_id, user_id),
    FOREIGN KEY               (group_id, election_id) REFERENCES elections (group_id, xid),
    FOREIGN KEY               (group_id, source_transaction_id) REFERENCES transactions (entity_id,xid),
    FOREIGN KEY               (group_id, destination_transaction_id) REFERENCES transactions (entity_id,xid)
);


CREATE TABLE IF NOT EXISTS loan_repayments (
    group_id              INT NOT NULL,
    transaction_id        INT NOT NULL,
    user_id               INT NOT NULL,
    request_id            INT NOT NULL,
    created_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY           (group_id, transaction_id),
    --FOREIGN KEY           (user_id, transaction_id) REFERENCES transactions (entity_id, xid),
    FOREIGN KEY           (group_id, request_id) REFERENCES debit_requests (group_id, xid)
);
GRANT INSERT, SELECT ON loan_repayments TO app_user;
SELECT create_distributed_table(' loan_repayments', 'group_id');