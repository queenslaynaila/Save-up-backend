CREATE OR REPLACE FUNCTION request_group_withdrawal(
  p_group_id         INT,
  p_pocket_id        INT,
  p_initiator_id     INT,
  p_reason           TEXT,
  p_recipients       JSON[]
)
RETURNS VOID AS $$
DECLARE
  v_current_balance   NUMERIC;
  v_withdrawal_id     INT;
  v_latest_election_id INT;
  v_total_amount      NUMERIC;
  v_type_id           INT;
BEGIN
  SELECT SUM((recipients ->> 'amount')::NUMERIC)
  INTO v_total_amount
  FROM UNNEST(p_recipients) AS recipients;

  v_current_balance := get_transaction_info(p_group_id, p_pocket_id);
  IF v_current_balance < v_total_amount THEN
    RAISE EXCEPTION USING
        MESSAGE = 'ERR_INSUFFICIENT_FUNDS',
        ERRCODE = 'P0004';
  END IF;

  SELECT id INTO STRICT v_type_id 
  FROM debit_request_types 
  WHERE type = 'Withdrawal';

  SELECT MAX(xid)
  INTO STRICT v_latest_election_id
  FROM elections
  WHERE group_id = p_group_id
    AND status = 'Closed'
    AND closed_at IS NOT NULL;

  INSERT INTO debit_requests (
    group_id, xid, election_id, initiator_id, type_id, pocket_id, amount, reason
  )
  SELECT (
    p_group_id,
    COALESCE(MAX(xid), 0) + 1,
    v_latest_election_id,
    p_initiator_id,
    v_type_id,
    p_pocket_id,
    v_total_amount,
    p_reason
  )
  FROM debit_requests
  WHERE group_id = p_group_id
  RETURNING xid INTO STRICT v_withdrawal_id;

  INSERT INTO withdrawal_debit_recipients (group_id, request_id, user_id, amount)
  SELECT
    p_group_id,
    v_withdrawal_id,
    (recipients ->> 'recipient_id')::INT,
    (recipients ->> 'amount')::NUMERIC
  FROM UNNEST(p_recipients) AS recipients;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION request_group_withdrawal(
  INT, INT, INT, TEXT, JSON[]
) TO saveup_www;

SELECT create_distributed_function(
  'request_group_withdrawal(INT, INT, INT, TEXT, JSON[])', 
  'p_group_id'
);
