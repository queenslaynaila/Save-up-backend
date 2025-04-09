CREATE OR REPLACE FUNCTION withdraw_from_user_pocket(
  p_user_id       INT,
  p_pocket_id     INT,
  p_amount        NUMERIC,
  p_accept_penalty BOOLEAN DEFAULT FALSE
) RETURNS VOID AS $$
DECLARE
  v_is_locked       BOOLEAN;
  v_penalty_amount  NUMERIC;
BEGIN
  SELECT (pocket_type = 'Locked' AND target_at > NOW())
  INTO STRICT v_is_locked
  FROM pockets
  WHERE xid = p_pocket_id
    AND entity_id = p_user_id;

  IF v_is_locked AND NOT p_accept_penalty THEN
    RAISE EXCEPTION USING
      MESSAGE = 'ERR_FUNDS_LOCKED',
      ERRCODE = 'P0005';
  END IF;

  PERFORM process_transaction(
    p_user_id,
    'Withdrawal',
    p_pocket_id,
    p_amount * -1
  );

  IF v_is_locked AND p_accept_penalty THEN
    v_penalty_amount := p_amount * 0.05;

    PERFORM process_transaction(
      p_user_id,
      'Penalty',
      p_pocket_id,
      v_penalty_amount * -1
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION withdraw_from_user_pocket(
  INT, INT, NUMERIC, BOOLEAN
) TO saveup_www;

SELECT create_distributed_function(
  'withdraw_from_user_pocket(INT, INT, NUMERIC, BOOLEAN)',
  'p_user_id'
);