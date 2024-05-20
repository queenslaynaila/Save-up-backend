CREATE SEQUENCE transfer_transaction_seq START 1;

CREATE OR REPLACE FUNCTION log_transfer_transaction(
    p_source_pocket_id        INT, 
    p_destination_pocket_id   INT, 
    p_amount                  NUMERIC(30, 2), 
    p_user_id                 INT
)
RETURNS TABLE (
 source_pocket_name       TEXT,
 destination_pocket_name  TEXT
) AS $$
DECLARE
  v_source_pocket_balance NUMERIC(30, 2);
  v_destination_pocket_balance NUMERIC(30, 2);
  v_new_source_balance NUMERIC(30, 2);
  v_new_destination_balance NUMERIC(30, 2);
  v_reference_no TEXT;
BEGIN 
  SELECT COALESCE(cumulative_amount, 0) INTO v_source_pocket_balance
  FROM transaction_logs
  WHERE pocket_id = p_source_pocket_id
  ORDER BY transaction_id DESC
  LIMIT 1;
  
  -- Run transaction only if the source pocket has enough money to transfer
  IF v_source_pocket_balance >= p_amount THEN
    INSERT INTO transfers (id, source_pocket_id, destination_pocket_id, amount, user_id)
    VALUES ((SELECT COALESCE(MAX(id), 0) + 1 FROM transfers WHERE user_id = p_user_id),
          p_source_pocket_id, 
          p_destination_pocket_id, 
          p_amount, 
          p_user_id);
          
    v_new_source_balance = COALESCE(v_source_pocket_balance, 0) - p_amount;
    v_new_destination_balance = COALESCE(v_destination_pocket_balance, 0) + p_amount;
    v_reference_no = 'TRANSFERIN' || nextval('transfer_transaction_seq');

    INSERT INTO transaction_logs (
        transaction_id, 
        pocket_id, 
        entity_id, 
        transaction_type, 
        amount, 
        cumulative_amount, 
        reference_no, 
        created_at
      )
    SELECT
          COALESCE((SELECT MAX(transaction_id) + 1 FROM transaction_logs WHERE pocket_id = p_source_pocket_id), 1),
          p_source_pocket_id,
          p_user_id,
          'Transfer Out'::enum_transaction_type, 
          p_amount,
          v_new_source_balance,
          v_reference_no,  
          NOW();

    INSERT INTO transaction_logs (
        transaction_id, 
        pocket_id, 
        entity_id, 
        transaction_type, 
        amount, 
        cumulative_amount, 
        reference_no, 
        created_at
      )
    SELECT
          COALESCE((SELECT MAX(transaction_id) + 1 FROM transaction_logs WHERE pocket_id = p_destination_pocket_id), 1),
          p_destination_pocket_id,
          p_user_id,
          'Transfer In'::enum_transaction_type, 
          p_amount,
          v_new_destination_balance,
          v_reference_no, 
          NOW();

      RETURN QUERY SELECT 
         (SELECT name FROM pockets WHERE id = p_source_pocket_id) AS source_pocket_name,
         (SELECT name FROM pockets WHERE id = p_destination_pocket_id) AS destination_pocket_name;
  ELSE
    RAISE EXCEPTION 'Insufficient funds in source pocket for transfer.';
  END IF;
END;
$$ LANGUAGE plpgsql;
