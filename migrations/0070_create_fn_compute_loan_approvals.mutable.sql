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
    v_pocket_id INT;
    v_recipient_id INT;
    v_amount NUMERIC(30, 2);
    v_reference_id INT;
    v_transaction_id INT;
    v_current_balance NUMERIC(30, 2);
    v_new_balance NUMERIC(30, 2);
    v_recipient_record RECORD;
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
        RAISE EXCEPTION 'ERR_GROUP_NOT_ADMIN' USING ERRCODE = 'P0002';
    END IF;

    SELECT COUNT(*) INTO v_total_admins
    FROM group_admins
    WHERE group_id = p_group_id
      AND election_id = v_latest_election_id;

    SELECT COUNT(*) INTO v_approved_admins
    FROM debit_approvals
    WHERE group_id = p_group_id
      AND request_id = p_request_id
      AND status = 'Approved';

    SELECT COUNT(*) INTO v_rejected_count
    FROM debit_approvals
    WHERE group_id = p_group_id
      AND request_id = p_request_id
      AND status = 'Rejected';

    IF v_rejected_count > 0 THEN
        UPDATE debit_requests
        SET status = 'Rejected'
        WHERE group_id = p_group_id
          AND xid = p_request_id;
        RETURN;
    END IF;

    IF v_approved_admins = v_total_admins THEN
        SELECT pocket_id INTO STRICT v_pocket_id
        FROM debit_requests
        WHERE group_id = p_group_id
          AND xid = p_request_id;

        v_current_balance := get_transaction_info(p_group_id, v_pocket_id);

        FOR v_recipient_record IN
            SELECT recipient_id, amount
            FROM debit_recipients
            WHERE group_id = p_group_id
              AND request_id = p_request_id
        LOOP
            v_reference_id := floor(random() * 1000000 + 1)::INT;
            
            v_new_balance := v_current_balance - v_recipient_record.amount;

            v_current_balance := v_new_balance;

            v_transaction_id := insert_transaction_log(
                p_group_id,
                4,
                v_pocket_id,
                v_reference_id,
                v_recipient_record.amount,
                v_new_balance
            );

            INSERT INTO disbursements (
                group_id,
                transaction_id,
                request_id,
                user_id
            )
            VALUES (
                p_group_id,
                v_transaction_id,
                p_request_id,
                v_recipient_record.recipient_id
            );
        END LOOP;

        UPDATE debit_requests
        SET status = 'Approved'
        WHERE group_id = p_group_id
          AND xid = p_request_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION compute_loan_approvals(INT, INT, INT) TO saveup_www;
