CREATE TABLE IF NOT EXISTS debit_requests (
    group_id              INT NOT NULL,
    xid                   INT NOT NULL,
    election_id           INT NOT NULL,
    initiator_id          INT NOT NULL,
    type_id               INT NOT NULL,
    pocket_id             INT NOT NULL,
    amount                NUMERIC(30, 2) NOT NULL CHECK (amount > 0),
    reason                TEXT NOT NULL,
    status                enum_approval_status NOT NULL DEFAULT 'Pending',
    created_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY           (group_id, xid),
    FOREIGN KEY           (group_id, initiator_id) REFERENCES group_members (group_id, user_id),
    FOREIGN KEY           (group_id, election_id) REFERENCES elections (group_id, xid),
    FOREIGN KEY           (type_id) REFERENCES debit_types (id)
);
GRANT INSERT, SELECT ON debit_requests TO app_user;
SELECT create_distributed_table('debit_requests', 'group_id');
ALTER TABLE debit_requests
ADD FOREIGN KEY (type_id) REFERENCES debit_types (id);

