CREATE OR REPLACE FUNCTION review_debit_request(
    p_group_id          INT,
    p_debit_id          INT,
    p_admin_id          INT,
    p_status            enum_approval_status,
    p_reason            TEXT
)
RETURNS VOID AS $$
DECLARE
    v_latest_election_id    INT;
v_approved_count            NUMERIC;
v_total_admins              numeric;

BEGIN
    --get the latest election
    SELECT MAX(xid)
    INTO STRICT v_latest_election_id
    FROM elections
    WHERE group_id = p_group_id
    AND status = 'Closed'
    AND closed_at is not null;

    INSERT INTO debit_approvals(
        group_id, request_id, admin_id, election_id, status, reason, created_at
    )
    VALUES (
               p_group_id,
               p_debit_id,
               p_admin_id,
               v_latest_election_id,
               p_status,
               p_reason,
               NOW()
           );

    IF p_status = 'Rejected' THEN
        UPDATE debit_requests
        SET status = 'Rejected'
        WHERE group_id = p_group_id
          AND xid = p_debit_id;
        RETURN;
    ELSE
        SELECT COUNT(*) INTO v_total_admins
        FROM group_admins
        WHERE group_id = p_group_id
          AND election_id = v_latest_election_id;

        SELECT COUNT(*) INTO v_approved_count
        FROM debit_approvals
        WHERE group_id = p_group_id
          AND request_id = p_debit_id
          AND status = 'Approved';

        IF v_approved_count = v_total_admins THEN
            UPDATE debit_requests
            SET status = 'Approved'
            WHERE group_id = p_group_id
              AND xid = p_debit_id;


            PERFORM disburse_funds(p_group_id, p_debit_id, p_amount);
        END IF;
    END IF;

END;
$$ LANGUAGE plpgsql;
