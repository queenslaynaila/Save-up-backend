CREATE TABLE IF NOT EXISTS group_debit_disbursements (
    group_id              INT NOT NULL,
    transaction_id        INT NOT NULL,
    request_id            INT NOT NULL,
    user_id               INT NOT NULL,
    created_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY           (group_id, transaction_id),
    FOREIGN KEY           (group_id, request_id) REFERENCES debit_requests (group_id, xid),
    FOREIGN KEY           (group_id, transaction_id) REFERENCES transactions (group_id, xid)
);
GRANT INSERT, SELECT ON group_debit_disbursements TO saveup_www;
SELECT create_distributed_table('group_debit_disbursements', 'group_id');

