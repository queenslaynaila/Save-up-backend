CREATE TABLE IF NOT EXISTS guarantor_approvals (
    group_id         INT NOT NULL,
    request_id       INT NOT NULL,
    guarantor_id     INT NOT NULL,
    approval         BOOLEAN NOT NULL,
    created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY      (group_id, request_id),
    FOREIGN KEY      (group_id, request_id) REFERENCES debit_requests (group_id, xid)
);
GRANT INSERT, SELECT ON guarantor_approvals TO saveup_www;
SELECT create_distributed_table ('guarantor_approvals', 'group_id');

