BEGIN;

    SET LOCAL citus.multi_shard_modify_mode TO 'sequential';
    CREATE TABLE IF NOT EXISTS group_joins (
        group_id INT NOT NULL,
        user_id INT NOT NULL,
        xid INT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        PRIMARY KEY (group_id, user_id, xid),
        FOREIGN KEY (group_id, user_id) REFERENCES group_members (group_id, user_id)
    );
    SELECT create_distributed_table('group_joins', 'group_id');
    GRANT INSERT, SELECT ON group_joins TO saveup_www;

COMMIT;
