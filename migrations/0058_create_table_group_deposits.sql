CREATE TABLE IF NOT EXISTS group_deposits (
    group_id              INT NOT NULL,
    deposit_id            INT NOT NULL,
    user_id               INT NOT NULL,
    PRIMARY KEY           (group_id, deposit_id),
    FOREIGN KEY           (group_id, deposit_id) REFERENCES transactions (entity_id, xid),
    FOREIGN KEY           (group_id, user_id) REFERENCES group_members (group_id, user_id)
);
GRANT INSERT, SELECT ON group_deposits TO saveup_www;
SELECT create_distributed_table('group_deposits', 'group_id');

