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
        RAISE EXCEPTION 'ERR_GROUP_NOT_ADMIN',
            'P0002';
    END IF;

    INSERT INTO debit_approvals (group_id, request_id, admin_id, election_id, status, reason)
    VALUES (p_group_id, p_request_id, p_admin_id, v_latest_election_id, p_status, p_reason);

    PERFORM compute_loan_approvals(p_group_id, p_request_id, p_admin_id);
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION approve_debit( INT, INT, INT, enum_approval_status, TEXT ) TO app_user;
SELECT create_distributed_function(
               'approve_debit(INT, INT, INT, enum_approval_status, TEXT)', 'p_group_id'
);

CREATE OR REPLACE FUNCTION compute_loan_approvals(
    p_group_id   INT,
    p_request_id INT,
    p_admin_id   INT
) RETURNS VOID AS $$
DECLARE
    v_latest_election_id INT;
    v_total_admins INT;
    v_approved_admins INT;
    v_rejected_count INT;
BEGIN
    -- 1️⃣ Get the latest closed election ID
    SELECT MAX(xid)
    INTO STRICT v_latest_election_id
    FROM elections
    WHERE group_id = p_group_id
      AND status = 'Closed';

    -- 2️⃣ Ensure caller is an admin in the latest election
    IF NOT EXISTS (
        SELECT 1
        FROM group_admins
        WHERE group_id = p_group_id
          AND election_id = v_latest_election_id
          AND user_id = p_admin_id
    ) THEN
        RAISE EXCEPTION 'ERR_GROUP_NOT_ADMIN' USING ERRCODE = 'P0002';
    END IF;

    -- 3️⃣ Get total number of admins in the group
    SELECT COUNT(*) INTO v_total_admins
    FROM group_admins
    WHERE group_id = p_group_id
      AND election_id = v_latest_election_id;

    -- 4️⃣ Count the number of admins who have approved this request
    SELECT COUNT(*) INTO v_approved_admins
    FROM debit_approvals
    WHERE group_id = p_group_id
      AND request_id = p_request_id
      AND status = 'Approved';

    -- 5️⃣ Check if any admin has rejected the request
    SELECT COUNT(*) INTO v_rejected_count
    FROM debit_approvals
    WHERE group_id = p_group_id
      AND request_id = p_request_id
      AND status = 'Rejected';

    -- 6️⃣ If at least one admin rejects, mark request as 'Rejected'
    IF v_rejected_count > 0 THEN
        UPDATE debit_requests
        SET status = 'Rejected'
        WHERE group_id = p_group_id
          AND xid = p_request_id;
        RETURN;
    END IF;

    -- 7️⃣ If all admins have approved, mark request as 'Approved'
    IF v_approved_admins = v_total_admins THEN
        UPDATE debit_requests
        SET status = 'Approved'
        WHERE group_id = p_group_id
          AND xid = p_request_id;
    END IF;
END;
$$ LANGUAGE plpgsql;
