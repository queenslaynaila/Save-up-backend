CREATE TABLE IF NOT EXISTS group_transfers (
    group_id                  INT NOT NULL,
    source_transaction_id     INT NOT NULL,  -- Reference to the transfer out
    destination_transaction_id INT NOT NULL,  -- Reference to the transfer in
    election_id               INT NOT NULL,
    admin_id                  INT NOT NULL,
    created_at                TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY               (group_id, source_transaction_id, destination_transaction_id),
    FOREIGN KEY               (group_id, admin_id) REFERENCES group_members (group_id, user_id),
    FOREIGN KEY               (group_id, election_id) REFERENCES elections (group_id, xid),
    FOREIGN KEY               (group_id, source_transaction_id) REFERENCES transactions (entity_id,xid),
    FOREIGN KEY               (group_id, destination_transaction_id) REFERENCES transactions (entity_id,xid)
);


