CREATE OR REPLACE FUNCTION create_saving(
  p_entity_id   INT,
  p_user_id     INT,
  p_pocket_id   INT,
  p_amount      NUMERIC
) 
RETURNS VOID AS $$
DECLARE
  v_current_balance      NUMERIC;
  v_new_balance          NUMERIC;
  v_reference_id         TEXT;
  v_transaction_id       INT;
  v_is_group             BOOLEAN;
  v_transaction_type_id  INT;
BEGIN
  SELECT entity_type = 'Group' 
  INTO STRICT v_is_group 
  FROM entities
  WHERE id = p_entity_id;

  v_current_balance := get_transaction_info(p_entity_id, p_pocket_id);
  v_new_balance := v_current_balance + p_amount;

  v_reference_id := 'TXN' || floor(random() * 1000000 + 1)::TEXT;

  UPDATE pockets
  SET status = 'Completed'::enum_status,
      completed_at = NOW()
  WHERE entity_id = p_entity_id
    AND xid = p_pocket_id
    AND status = 'In Progress'::enum_status
    AND v_current_balance >= pockets.target_amount;

  SELECT id 
  INTO STRICT v_transaction_type_id
  FROM transaction_types
  WHERE slug = 'Saving';

  IF v_transaction_type_id IS NULL THEN
    RAISE EXCEPTION USING 
      MESSAGE = 'ERR_TRANSACTION_TYPE_NOT_FOUND',
      ERRCODE = 'P0005';
  END IF;

  v_transaction_id := insert_transaction_log(
    p_entity_id,
    v_transaction_type_id,
    p_pocket_id,
    v_reference_id, 
    p_amount,
    v_new_balance
  );

  IF v_is_group THEN
    INSERT INTO group_deposits (
      group_id,
      deposit_id,
      user_id
    ) VALUES (
      p_entity_id,
      v_transaction_id,
      p_user_id
    );
  END IF;
END;
$$ LANGUAGE plpgsql;


GRANT EXECUTE ON FUNCTION create_saving(
  INT, INT, INT, NUMERIC
) TO saveup_www;

SELECT create_distributed_function(
  'create_saving(INT, INT, INT, NUMERIC)',
  'p_entity_id'
);