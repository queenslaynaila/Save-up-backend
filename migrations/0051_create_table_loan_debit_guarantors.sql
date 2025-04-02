CREATE TABLE IF NOT EXISTS loan_debit_guarantors (
    group_id          INT NOT NULL,
    request_id        INT NOT NULL,
    guarantor_id      INT NOT NULL,
    PRIMARY KEY       (group_id, request_id, guarantor_id),
    FOREIGN KEY       (group_id, request_id) REFERENCES debit_requests (group_id, xid),
    FOREIGN KEY       (group_id, guarantor_id) REFERENCES group_members (group_id, user_id)
);
GRANT INSERT, SELECT ON  loan_debit_guarantors TO saveup_www;
SELECT create_distributed_table('loan_debit_guarantors', 'group_id');