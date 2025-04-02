CREATE TABLE IF NOT EXISTS donations (
    entity_id              INT NOT NULL,
    transaction_id        INT NOT NULL,
    donor_name                 TEXT NOT NULL,
    created_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY           (entity_id, transaction_id),
    FOREIGN KEY           (entity_id, transaction_id) REFERENCES transactions (entity_id, xid)
);
GRANT INSERT, SELECT ON donations TO saveup_www;
SELECT create_distributed_table('donations', 'entity_id');

