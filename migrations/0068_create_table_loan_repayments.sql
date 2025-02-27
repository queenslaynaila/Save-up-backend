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
