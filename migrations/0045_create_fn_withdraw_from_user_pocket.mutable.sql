CREATE OR REPLACE FUNCTION withdraw_from_user_pocket(
  p_user_id           INT,
  p_pocket_id         INT,
  p_amount            NUMERIC,
  p_accept_penalty    BOOLEAN DEFAULT FALSE
) RETURNS VOID AS $$
DECLARE
  v_current_balance      NUMERIC(30, 2);
  v_is_locked            BOOLEAN;
  v_new_balance          NUMERIC(30, 2);
  v_reference_id         TEXT;
  v_transaction_type_id  INT;
  v_penalty_type_id      INT;
  v_penalty_amount       NUMERIC(30, 2);
  v_final_balance        NUMERIC(30, 2);
BEGIN
  v_current_balance := get_transaction_info(p_user_id, p_pocket_id);

  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION USING
      MESSAGE = 'ERR_INSUFFICIENT_FUNDS',
      ERRCODE = 'P0004';
  END IF;

  SELECT (pocket_type = 'Locked' AND target_at > NOW()) 
  INTO STRICT v_is_locked
  FROM pockets
  WHERE xid = p_pocket_id AND entity_id = p_user_id;

  IF v_is_locked AND NOT p_accept_penalty THEN
    RAISE EXCEPTION USING
      MESSAGE = 'ERR_FUNDS_LOCKED',
      ERRCODE = 'P0005';
  END IF;

  v_reference_id := 'TXN' || floor(random() * 1000000 + 1)::TEXT;

  SELECT id INTO STRICT v_transaction_type_id
  FROM transaction_types
  WHERE slug = 'Withdrawal';

  v_new_balance := v_current_balance - p_amount;

  PERFORM insert_transaction_log(
    p_user_id,
    v_transaction_type_id,
    p_pocket_id,
    v_reference_id,
    p_amount * -1,
    v_new_balance
  );

  IF v_is_locked AND p_accept_penalty THEN

    v_penalty_amount := p_amount * 0.05;
    v_final_balance := v_new_balance - v_penalty_amount;

    SELECT id INTO STRICT v_penalty_type_id
    FROM transaction_types
    WHERE slug = 'Penalty';

    PERFORM insert_transaction_log(
      p_user_id,
      v_penalty_type_id,
      p_pocket_id,
      v_reference_id || '_PENALTY',
      v_penalty_amount * -1,
      v_final_balance
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION withdraw_from_user_pocket(INT, INT, NUMERIC, BOOLEAN) TO saveup_www;

SELECT create_distributed_function(
  'withdraw_from_user_pocket(INT, INT, NUMERIC, BOOLEAN)',
  'p_user_id'
);