CREATE OR REPLACE FUNCTION approve_loan(
    p_group_id      INT,
    p_request_id    INT,
    p_admin_id      INT,
    p_status        enum_approval_status,
    p_reason        TEXT
)
RETURNS VOID AS $$
DECLARE
    v_latest_election_id INT;
BEGIN
    SELECT MAX(xid)
    INTO STRICT v_latest_election_id
    FROM elections
    WHERE group_id = p_group_id
      AND status = 'Closed';

    IF NOT EXISTS (
        SELECT 1
        FROM group_admins
        WHERE group_id = p_group_id
          AND election_id = v_latest_election_id
          AND user_id = p_admin_id
    ) THEN
        RAISE EXCEPTION 'ERR_GROUP_NOT_ADMIN: Admin is not part of the group or not in the latest election',
            'P0002';
    END IF;

    INSERT INTO loan_admin_approvals (group_id, request_id, admin_id, status, reason)
    VALUES (p_group_id, p_request_id, p_admin_id, p_status, p_reason);
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION approve_loan( INT, INT, INT, enum_approval_status, TEXT ) TO app_user;
SELECT create_distributed_function(
'approve_loan(INT, INT, INT, enum_approval_status, TEXT)', 'p_group_id'
);