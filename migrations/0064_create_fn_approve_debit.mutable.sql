CREATE OR REPLACE FUNCTION review_debit_request(
  p_group_id  INT,
  p_debit_id  INT,
  p_admin_id  INT,
  p_status    enum_approval_status,
  p_reason    TEXT
)
RETURNS VOID AS $$
DECLARE
  v_latest_election_id      INT;
  v_approved_count          NUMERIC;
  v_total_admins            NUMERIC;
  v_debit_type              enum_debit_type;
  v_pocket_id               INT;
  v_initiator_id            INT;
  v_amount                  NUMERIC(30,2);
  v_current_group_balance   NUMERIC(30,2);
  v_new_group_balance       NUMERIC(30,2);
  v_wallet_balance          NUMERIC(30,2);
  v_new_wallet_balance      NUMERIC(30,2);
  v_reference_id            TEXT;
  v_transaction_id          INT;
  v_transaction_type_id     INT;
  v_recipient_record        RECORD;
BEGIN
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

    IF p_status = 'Rejected' THEN
      UPDATE debit_requests
      SET status = 'Rejected'
      WHERE group_id = p_group_id
        AND xid = p_debit_id;
      RETURN;
    END IF;

    SELECT COUNT(*) INTO v_total_admins
    FROM group_admins
    WHERE group_id = p_group_id
      AND election_id = v_latest_election_id;

    SELECT COUNT(*) INTO v_approved_count
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

    v_current_group_balance := get_transaction_info(p_group_id, v_pocket_id);
    IF v_current_group_balance < v_amount THEN
      RAISE EXCEPTION USING
        MESSAGE = 'ERR_INSUFFICIENT_FUNDS',
        ERRCODE = 'P0004';
    END IF;

    IF v_debit_type = 'Loan' THEN
      v_new_group_balance := v_current_group_balance - v_amount;
      v_reference_id := 'TXNLOAN' || floor(random() * 1000000 + 1)::TEXT;

      SELECT id INTO STRICT v_transaction_type_id
      FROM transaction_types
      WHERE slug = 'Loan';

      v_transaction_id := insert_transaction_log(
        p_group_id,
        v_transaction_type_id,
        v_pocket_id,
        v_reference_id,
        -v_amount,
        v_new_group_balance
      );

      v_wallet_balance := get_transaction_info(v_initiator_id, 1);
      v_new_wallet_balance := v_current_group_balance + v_amount;

      v_transaction_id := insert_transaction_log(
        v_initiator_id,
        v_transaction_type_id,
        1,
        v_reference_id,
        v_amount,
        v_new_wallet_balance
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
        v_new_group_balance := v_current_group_balance - v_recipient_record.amount;
        v_reference_id := 'TXNWITHDRAW' || floor(random() * 1000000 + 1)::TEXT;

        SELECT id INTO STRICT v_transaction_type_id
        FROM transaction_types
        WHERE slug = 'Withdrawal';

        v_transaction_id := insert_transaction_log(
          p_group_id,
          v_transaction_type_id,
          v_pocket_id,
          v_reference_id,
          -v_recipient_record.amount,
          v_new_group_balance
        );

        v_current_group_balance := v_new_group_balance;

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