BEGIN;
    SET LOCAL citus.multi_shard_modify_mode TO 'sequential';
    CREATE TABLE IF NOT EXISTS group_transfers (
        group_id INT NOT NULL,
        source_transaction_id INT NOT NULL,
        destination_transaction_id INT NOT NULL,
        election_id INT NOT NULL,
        admin_id INT NOT NULL,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        FOREIGN KEY (group_id, source_transaction_id) REFERENCES transactions (entity_id, xid),
        FOREIGN KEY (group_id, election_id) REFERENCES elections (group_id, xid),
        FOREIGN KEY (group_id, destination_transaction_id) REFERENCES transactions (entity_id, xid),
        PRIMARY KEY (group_id, source_transaction_id, destination_transaction_id)
    );

    GRANT INSERT, SELECT ON group_transfers TO saveup_www;
    SELECT create_distributed_table('group_transfers', 'group_id');

COMMIT;
