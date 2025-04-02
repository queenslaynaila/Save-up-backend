CREATE OR REPLACE FUNCTION create_donation(
  p_entity_id       INT,
  p_pocket_id       INT,
  p_reference_no    TEXT,
  p_donor_name      TEXT,
  p_amount          NUMERIC
) 
RETURNS VOID AS $$
DECLARE
  v_current_balance      NUMERIC;
  v_new_balance          NUMERIC;
  v_transaction_id       INT;
  v_transaction_type_id  INT;
BEGIN
  v_current_balance := get_transaction_info(p_entity_id, p_pocket_id);
  v_new_balance := v_current_balance + p_amount;

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
  WHERE slug = 'Donations';

  v_transaction_id := insert_transaction_log(
    p_entity_id,
    v_transaction_type_id,
    p_pocket_id,
    p_reference_no,
    p_amount,
    v_new_balance
  );

  INSERT INTO donations (
    entity_id,
    transaction_id,
    donor_name
  ) VALUES (
    p_entity_id,
    v_transaction_id,
    p_donor_name
  );
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION create_donation(
  INT, INT, TEXT, TEXT, NUMERIC
) TO saveup_www;

SELECT create_distributed_function(
  'create_donation(INT, INT, TEXT, TEXT, NUMERIC)',
  'p_entity_id'
);
