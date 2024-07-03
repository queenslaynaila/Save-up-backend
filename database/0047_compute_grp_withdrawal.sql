CREATE OR REPLACE FUNCTION approve_group_withdrawal(
    p_group_id           INT,
    p_admin_id           INT, 
    p_withdrawal_id      INT,
    p_status             enum_approval_status,
    p_reason             TEXT
)
RETURNS VOID AS $$
DECLARE
    v_latest_election_id   INT;
    v_total_admins         INT;
    v_approved_count       INT;
BEGIN 
    PERFORM check_grp_membership(p_admin_id, p_group_id);

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
        RAISE EXCEPTION 'ERR_NOT_GROUP_ADMIN';
    END IF;

    INSERT INTO group_withdrawals_approvals
    VALUES (
        p_group_id, 
        p_withdrawal_id,
        p_admin_id,
        v_latest_election_id,
        p_status::enum_approval_status, 
        p_reason
    );

    SELECT COUNT(*) INTO STRICT v_total_admins
    FROM group_admins
    WHERE group_id = p_group_id
    AND election_id = v_latest_election_id;

    SELECT COUNT(*) INTO STRICT v_approved_count
    FROM group_withdrawals_approvals
    WHERE group_id = p_group_id
    AND withdrawal_id = p_withdrawal_id
    AND election_id = v_latest_election_id
    AND status = 'Approved';

    IF v_approved_count < v_total_admins THEN
        RETURN;
    END IF;

    PERFORM complete_group_withdrawal(p_withdrawal_id, p_group_id);
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION approve_group_withdrawal(INT, INT, INT, enum_approval_status, TEXT) TO app_user;
SELECT create_distributed_function(
  'approve_group_withdrawal(INT, INT, INT, enum_approval_status, TEXT)', 'p_group_id'
)