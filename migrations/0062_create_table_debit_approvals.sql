DO $$
BEGIN
   CREATE TYPE enum_approval_status AS ENUM (
        'Approved', 
        'Rejected', 
        'Pending'
    );
EXCEPTION
  WHEN DUPLICATE_OBJECT THEN NULL;
END
$$;

CREATE TABLE IF NOT EXISTS debit_approvals (
    group_id              INT NOT NULL,
    request_id            INT NOT NULL,
    admin_id              INT NOT NULL,
    election_id           INT NOT NULL,
    status                enum_approval_status NOT NULL,
    reason                TEXT NOT NULL,
    created_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY           (group_id, request_id, admin_id),
    FOREIGN KEY           (group_id, election_id, admin_id) REFERENCES group_admins (group_id, election_id, user_id),
    FOREIGN KEY           (group_id, request_id) REFERENCES debit_requests (group_id, xid)
);
GRANT INSERT, SELECT ON debit_approvals TO saveup_www;
SELECT create_distributed_table('debit_approvals', 'group_id');