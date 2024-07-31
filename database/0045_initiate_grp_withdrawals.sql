CREATE OR REPLACE FUNCTION initiate_grp_withdrawal(
  p_group_id             INT,
  p_pocket_id            INT,
  p_initiator_id         INT,
  p_amount               NUMERIC,
  p_reason               enum_withdrawal_reason,
  p_recipient_object     JSON[]
)
RETURNS VOID AS $$
DECLARE
  v_current_balance     NUMERIC;
  v_withdrawal_id       INT;
  v_latest_election_id  INT;
BEGIN
  -- Current term in operation for the group
  SELECT MAX(xid)
  INTO STRICT v_latest_election_id
  FROM elections
  WHERE group_id = p_group_id
    AND status = 'Closed'
    AND closed_at IS NOT NULL;

  IF NOT EXISTS (
      SELECT 1
      FROM group_admins
      WHERE user_id = p_initiator_id
        AND group_id = p_group_id
        AND election_id = v_latest_election_id
    ) THEN
        RAISE EXCEPTION USING
          MESSAGE = 'ERR_NOT_ADMIN',
          ERRCODE = 'P0001';
  END IF;

  v_current_balance := get_transaction_info(p_group_id, p_pocket_id);
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION USING
        MESSAGE = 'ERR_INSUFFICIENT_FUNDS',
        ERRCODE = 'P0004';
  END IF;

  INSERT INTO debit_requests (
    group_id, xid, election_id, requestor_id, type_id, pocket_id, amount, reason
  )
  SELECT
    p_group_id,
    COALESCE(MAX(xid), 0) + 1,
    v_latest_election_id,
    p_initiator_id,
    2,
    p_pocket_id,
    p_amount,
    p_reason
  FROM group_withdrawal_requests
  WHERE group_id = p_group_id
  RETURNING xid INTO STRICT v_withdrawal_id;

  INSERT INTO debit_recipients (group_id, request_id, user_id, amount)
  SELECT
    p_group_id,
    v_withdrawal_id,
    (recipients ->> 'recipient_id')::INT,
    (recipients ->> 'amount')::NUMERIC
  FROM UNNEST(p_recipient_object) AS recipients;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION initiate_grp_withdrawal(
  INT, INT,  INT, NUMERIC, enum_withdrawal_reason, JSON
) TO app_user;
SELECT create_distributed_function(
  'initiate_grp_withdrawal(INT, INT, INT, NUMERIC, enum_withdrawal_reason, JSON[])', 'p_group_id'
);