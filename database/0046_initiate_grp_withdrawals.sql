CREATE OR REPLACE FUNCTION initiate_grp_withdrawal(
  p_group_id             INT,
  p_pocket_id            INT,
  p_election_id          INT,
  p_initiator_id         INT,
  p_amount               NUMERIC,
  p_reason               enum_withdrawal_reason,
  p_recipient_object     JSON[]
)
RETURNS VOID AS $$
DECLARE
  v_current_balance     NUMERIC;
  v_withdrawal_id       INT;
  v_recipient_record    JSON;
  v_recipient_id        INT;
  v_amount              NUMERIC; 
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM groups
    WHERE id = p_group_id
    AND deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'ERR_GROUP_NOT_ACTIVE';
  END IF;

  PERFORM check_grp_membership(p_initiator_id, p_group_id);

  SELECT * FROM get_transaction_info(p_pocket_id, p_group_id) 
  INTO STRICT v_current_balance;

  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'ERR_INSUFICIENT_BALANCE';
  END IF;

  INSERT INTO group_withdrawal_requests (
    group_id, xid, election_id, initiator_id, pocket_id, amount, reason
  )
  SELECT 
    p_group_id, 
    COALESCE(MAX(xid), 0) + 1, 
    p_election_id, 
    p_initiator_id, 
    p_pocket_id,
    p_amount, 
    p_reason
  FROM group_withdrawal_requests        
  WHERE group_id = p_group_id
  RETURNING xid INTO STRICT v_withdrawal_id;

  FOREACH v_recipient_record IN ARRAY p_recipient_object LOOP
    v_recipient_id := (v_recipient_record ->> 'recipient_id')::INT;
    v_amount := (v_recipient_record ->> 'amount')::NUMERIC;

    INSERT INTO group_withdrawals_recipients (group_id, withdrawal_id, user_id, amount)
    VALUES (p_group_id, v_withdrawal_id, v_recipient_id, v_amount);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION initiate_grp_withdrawal(
  INT, INT, INT, INT, NUMERIC, enum_withdrawal_reason, JSON
) TO app_user;
SELECT create_distributed_function(
  'initiate_grp_withdrawal(INT, INT, INT, INT, NUMERIC, enum_withdrawal_reason, JSON)', 'p_group_id'
);