CREATE OR REPLACE FUNCTION approve_group_withdrawal(
    p_group_id           INT,
    p_admin_id           INT, 
    p_election_id        INT,
    p_withdrawal_id      INT,
    p_status             TEXT,
    p_reason             TEXT
)
RETURNS VOID AS $$
DECLARE
    v_latest_election_id   INT;
BEGIN 
    IF NOT EXISTS (
        SELECT 1
        FROM groups
        WHERE id = p_group_id
        AND deleted_at IS NULL
    )THEN
        RAISE EXCEPTION 'The group is not active.';
    END IF;

    SELECT check_grp_membership(p_user_id, p_group_id);
    
    SELECT MAX(xid)
    INTO STRICT v_latest_election_id
    FROM elections
    WHERE group_id = p_group_id;

    IF NOT EXISTS (
        SELECT 1
        FROM group_admins
        WHERE group_id = p_group_id
        AND election_id = v_latest_election_id
        AND user_id = p_admin_id
    ) THEN
        RAISE EXCEPTION 'Only current admins can approve withdrawals.';
    END IF;

    INSERT INTO group_withdrawal_approvals
    VALUES (
        p_group_id, 
        p_withdrawal_id,
        p_admin_id,
        p_election_id,
        p_status, 
        p_reason
    );

    SELECT complete_group_withdrawal (p_withdrawal_id, p_group_id, p_election_id );
END
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION approve_group_withdrawal(INT, INT, INT, INT, INT, TEXT, TEXT) TO app_user;
SELECT create_distributed_function(
  'approve_group_withdrawal(INT, INT, INT, INT, INT, TEXT, TEXT)', 'p_group_id'
)