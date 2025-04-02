CREATE TYPE enum_guarantor_approval_status AS ENUM ('Pending', 'Approved', 'Rejected');


CREATE TABLE IF NOT EXISTS guarantor_approvals (
    group_id         INT NOT NULL,
    request_id       INT NOT NULL,
    guarantor_id     INT NOT NULL,
    approval         enum_guarantor_approval_status NOT NULL,
    created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY      (group_id, request_id, guarantor_id),
    FOREIGN KEY      (group_id, request_id, guarantor_id) REFERENCES loan_debit_guarantors (group_id, request_id, guarantor_id)
);
GRANT INSERT, SELECT ON guarantor_approvals TO saveup_www;
SELECT create_distributed_table ('guarantor_approvals', 'group_id');
