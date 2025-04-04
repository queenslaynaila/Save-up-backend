DO $$
BEGIN
    CREATE TYPE enum_debit_type AS ENUM ('Loan', 'Withdrawal');
EXCEPTION
    WHEN DUPLICATE_OBJECT THEN NULL;
END
$$;

DO $$
    BEGIN
        CREATE TYPE enum_approval_status AS ENUM (
            'Pending Guarantors',
            'Pending Admin Approval',
            'Approved',
            'Rejected',
            'Cancelled'
            );
    EXCEPTION
        WHEN DUPLICATE_OBJECT THEN
            NULL;
    END
$$;

CREATE TABLE IF NOT EXISTS debit_requests (
    group_id              INT NOT NULL,
    xid                   INT NOT NULL,
    initiator_id          INT NOT NULL,
    debit_type            enum_debit_type,
    pocket_id             INT NOT NULL,
    amount                NUMERIC(30, 2) NOT NULL CHECK (amount > 0),
    reason                TEXT NOT NULL,
    status                enum_approval_status NOT NULL,
    created_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY           (group_id, xid),
    FOREIGN KEY           (group_id, initiator_id) REFERENCES group_members (group_id, user_id),
    FOREIGN KEY           (group_id, pocket_id) REFERENCES pockets (entity_id, xid)
);
GRANT INSERT, SELECT ON debit_requests TO saveup_www;
SELECT create_distributed_table('debit_requests', 'group_id');







