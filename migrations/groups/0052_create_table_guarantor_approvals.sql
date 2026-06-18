BEGIN;
    SET LOCAL citus.multi_shard_modify_mode TO 'sequential';
    CREATE TABLE IF NOT EXISTS guarantor_approvals (
        group_id INT NOT NULL,
        request_id INT NOT NULL,
        guarantor_id INT NOT NULL,
        approval BOOLEAN NOT NULL,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        PRIMARY KEY (group_id, request_id, guarantor_id),
        FOREIGN KEY (
            group_id, request_id, guarantor_id
        ) REFERENCES loan_guarantors (group_id, request_id, guarantor_id)
    );
    GRANT INSERT, SELECT ON guarantor_approvals TO saveup_www;
    SELECT create_distributed_table('guarantor_approvals', 'group_id');

COMMIT;
