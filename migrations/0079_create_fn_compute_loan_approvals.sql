CREATE OR REPLACE FUNCTION compute_approvals (
    p_group_id           INT,
    p_request_id         INT,
    p_admin_id           INT
)
RETURNS VOID AS $$
DECLARE
    v_latest_election_id    INT;
    v_total_admins          INT;
    v_approved_count        INT;
    v_initiator_id          INT;
    v_transaction_id        INT;
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
        RAISE EXCEPTION USING
            MESSAGE = 'ERR_GROUP_NOT_ADMIN',
            ERRCODE = 'P0002';
    END IF;

    SELECT COUNT(*) INTO STRICT v_total_admins
    FROM group_admins
    WHERE group_id = p_group_id
      AND election_id = v_latest_election_id;

    SELECT COUNT(*) INTO STRICT v_approved_count
    FROM debit_approvals
    WHERE group_id = p_group_id
      AND request_id = p_request_id
      AND status = 'Approved';

    IF v_approved_count < v_total_admins THEN
        UPDATE debit_requests
        SET status = 'Denied'
        WHERE group_id = p_group_id
          AND xid = p_request_id;
    ELSE
        UPDATE debit_requests
        SET status = 'Approved'
        WHERE group_id = p_group_id
          AND xid = p_request_id;
    END IF;

    v_transaction_id := complete_group_withdrawal(p_group_id, p_request_id);

    SELECT initiator_id INTO STRICT v_initiator_id
    FROM debit_requests
    WHERE group_id = p_group_id
      AND xid = p_request_id;

    INSERT INTO disbursements (group_id, transaction_id, request_id, user_id)
    VALUES (p_group_id, v_transaction_id, p_request_id, v_initiator_id);
END;
$$ LANGUAGE plpgsql;

SELECT create_distributed_function(
    'compute_approvals(INT, INT, INT)', 'p_group_id'
);
GRANT EXECUTE ON FUNCTION compute_approvals(INT, INT, INT) TO app_user;