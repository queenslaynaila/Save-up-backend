CREATE TABLE IF NOT EXISTS loan_requests (
    group_id INT NOT NULL,
    request_id INT NOT NULL,
    repayment_period INTERVAL NOT NULL,
    PRIMARY KEY (group_id, request_id),
    FOREIGN KEY (group_id, request_id) REFERENCES debit_requests (group_id, xid)
);
GRANT INSERT, SELECT ON loan_requests TO saveup_www;
SELECT create_distributed_table('loan_requests', 'group_id');
