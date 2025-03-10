CREATE OR REPLACE FUNCTION approve_debit(
    p_group_id      INT,
    p_request_id    INT,
    p_admin_id      INT,
    p_status        enum_approval_status,
    p_reason        TEXT
)
RETURNS VOID AS $$
DECLARE
    v_latest_election_id INT;
    v_request_status enum_approval_status;
BEGIN
    -- Get the latest closed election ID for the group
    SELECT MAX(xid)
    INTO STRICT v_latest_election_id
    FROM elections
    WHERE group_id = p_group_id
      AND status = 'Closed';

    -- Check if the user is an admin for the latest closed election
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

    -- Check if the debit request exists and get its status
    SELECT status
    INTO v_request_status
    FROM debit_requests
    WHERE group_id = p_group_id
      AND xid = p_request_id;

    IF v_request_status IS NULL THEN
        RAISE EXCEPTION 'ERR_DEBIT_REQUEST_NOT_FOUND';
    END IF;

    -- Insert the approval record
    INSERT INTO debit_approvals (group_id, request_id, admin_id, election_id, status, reason)
    VALUES (p_group_id, p_request_id, p_admin_id, v_latest_election_id, p_status, p_reason);

    -- Compute loan approvals if the request is pending
    IF v_request_status = 'Pending' THEN
        PERFORM compute_loan_approvals(p_group_id, p_request_id, p_admin_id);
    END IF;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION approve_debit(INT, INT, INT, enum_approval_status, TEXT) TO saveup_www;

SELECT create_distributed_function(
  'approve_debit(INT, INT, INT, enum_approval_status, TEXT)', 'p_group_id'
);