BEGIN;
    SET LOCAL citus.multi_shard_modify_mode TO 'sequential';
    CREATE TABLE IF NOT EXISTS withdrawal_recipients (
        group_id INT NOT NULL,
        request_id INT NOT NULL,
        recipient_id INT NOT NULL,
        amount NUMERIC(30, 2) NOT NULL CHECK (amount > 0),
        PRIMARY KEY (group_id, request_id, recipient_id),
        FOREIGN KEY (group_id, request_id) REFERENCES debit_requests (
            group_id, xid
        ),
        FOREIGN KEY (group_id, recipient_id) REFERENCES group_members (
            group_id, user_id
        )
    );
    GRANT INSERT, SELECT ON withdrawal_recipients TO saveup_www;
    SELECT create_distributed_table('withdrawal_recipients', 'group_id');
COMMIT;