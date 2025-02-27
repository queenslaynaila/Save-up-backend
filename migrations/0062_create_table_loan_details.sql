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

