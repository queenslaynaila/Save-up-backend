CREATE OR REPLACE FUNCTION review_debit_request(
    p_group_id  INT,
    p_debit_id  INT,
    p_admin_id  INT,
    p_status    enum_approval_status,
    p_reason    TEXT
) RETURNS VOID AS $$
DECLARE
    v_latest_election_id      INT;
    v_approved_count          NUMERIC;
    v_total_admins            NUMERIC;
    v_debit_type              enum_debit_type;
    v_pocket_id               INT;
    v_initiator_id            INT;
    v_amount                  NUMERIC(30,2);
    v_current_group_balance   NUMERIC(30,2);
    v_transaction_id          INT;
    v_recipient_record        RECORD;
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM debit_requests
        WHERE group_id = p_group_id
          AND xid = p_debit_id
          AND status = 'Pending Admin Approval'
    ) THEN
        RAISE EXCEPTION USING
            MESSAGE = 'ERR_INVALID_DEBIT_REQUEST',
            ERRCODE = 'P0005';
    END IF;

    SELECT MAX(xid)
    INTO STRICT v_latest_election_id
    FROM elections
    WHERE group_id = p_group_id
      AND status = 'Closed'
      AND closed_at IS NOT NULL;

    INSERT INTO debit_approvals (
      group_id,
      request_id,
      admin_id,
      election_id,
      status,
      reason,
      created_at
    ) VALUES (
      p_group_id,
      p_debit_id,
      p_admin_id,
      v_latest_election_id,
      p_status,
      p_reason,
      NOW()
    );

    -- All admins must agree to the debit for it to be approved, any refusal is overall rejection
    IF p_status = 'Rejected' THEN
        UPDATE debit_requests
        SET status = 'Rejected'
        WHERE group_id = p_group_id
          AND xid = p_debit_id;
        RETURN;
    END IF;

    SELECT COUNT(*)
    INTO STRICT v_total_admins
    FROM group_admins
    WHERE group_id = p_group_id
      AND election_id = v_latest_election_id;

    SELECT COUNT(*)
    INTO STRICT v_approved_count
    FROM debit_approvals
    WHERE group_id = p_group_id
      AND request_id = p_debit_id
      AND status = 'Approved';

    IF v_approved_count < v_total_admins THEN
        RETURN;
    END IF;

    UPDATE debit_requests
    SET status = 'Approved'
    WHERE group_id = p_group_id
      AND xid = p_debit_id;

    SELECT debit_type, initiator_id, amount, pocket_id
    INTO STRICT v_debit_type, v_initiator_id, v_amount, v_pocket_id
    FROM debit_requests
    WHERE group_id = p_group_id
      AND xid = p_debit_id;

    SELECT COALESCE((
      SELECT balance
      FROM transactions
      WHERE pocket_id = v_pocket_id
        AND entity_id = p_group_id
        ORDER BY xid DESC
        LIMIT 1
     ), 0)
    INTO STRICT v_current_group_balance;

    IF v_current_group_balance < v_amount THEN
        RAISE EXCEPTION USING
            MESSAGE = 'ERR_INSUFFICIENT_FUNDS',
            ERRCODE = 'P0004';
    END IF;

    IF v_debit_type = 'Loan' THEN
      v_transaction_id := process_transaction(
        p_group_id,
        'Loan',
        v_pocket_id,
        v_amount * -1
      );

      -- Credit loan amount to the initiator's wallet
      v_transaction_id := process_transaction(
        v_initiator_id,
        'Loan',
        1,
        v_amount
      );

      INSERT INTO group_debit_disbursements (
        group_id,
        transaction_id,
        request_id,
        recipient_id
      ) VALUES (
        p_group_id,
        v_transaction_id,
        p_debit_id,
        v_initiator_id
      );
    ELSE
      FOR v_recipient_record IN (
        SELECT recipient_id, amount
        FROM withdrawal_recipients
        WHERE group_id = p_group_id
          AND request_id = p_debit_id
      )
      LOOP
        v_transaction_id := process_transaction(
          p_group_id,
          'Withdrawal',
          v_pocket_id,
          v_recipient_record.amount * -1
        );

        INSERT INTO group_debit_disbursements (
          group_id,
          transaction_id,
          request_id,
          recipient_id
        ) VALUES (
          p_group_id,
          v_transaction_id,
          p_debit_id,
          v_recipient_record.recipient_id
        );
      END LOOP;
    END IF;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION review_debit_request(
    INT,
    INT,
    INT,
    enum_approval_status,
    TEXT
) TO saveup_www;

SELECT create_distributed_function(
    'review_debit_request',
    'INT, INT, INT, enum_approval_status, TEXT'
);