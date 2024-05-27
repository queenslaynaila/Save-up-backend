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
  v_source_transaction_id INT;
  v_destination_transaction_id INT;
  v_source_balance NUMERIC(30, 2);
  v_destination_balance NUMERIC(30, 2);
BEGIN 
  SELECT 
        COALESCE(MAX(xid) + 1, 1) AS source_transaction_id,
        COALESCE((SELECT cumulative_amount
                FROM transaction_logs
                WHERE pocket_id = p_source_pocket_id
                ORDER BY xid DESC
                LIMIT 1), 0) AS v_source_balance
        INTO STRICT v_source_transaction_id, v_source_balance
  FROM transaction_logs
  WHERE pocket_id = p_source_pocket_id
  AND entity_id =  p_user_id;

  SELECT 
        COALESCE(MAX(xid) + 1, 1) AS destination_transaction_id,
        COALESCE((SELECT cumulative_amount
                FROM transaction_logs
                WHERE pocket_id = p_destination_pocket_id
                ORDER BY xid DESC
                LIMIT 1), 0) AS v_destination_balance
        INTO STRICT v_destination_transaction_id, v_destination_balance
  FROM transaction_logs
  WHERE pocket_id = p_destination_pocket_id
  AND entity_id =  p_user_id;
  
  -- Run transaction only if the source pocket has enough money to transfer
  IF  v_source_balance >= p_amount THEN
    INSERT INTO transfers (id, source_pocket_id, destination_pocket_id, amount, user_id)
    VALUES (
              v_source_transaction_id,
              p_source_pocket_id, 
              p_destination_pocket_id, 
              p_amount, 
              p_user_id
           );
          
    v_new_source_balance =  v_source_balance  - p_amount;
    v_new_destination_balance = v_destination_balance + p_amount;
    v_reference_no = 'TRANSFERIN' || substr(md5(random()::text), 1, 5);

    INSERT INTO transaction_logs (
        xid, 
        pocket_id, 
        entity_id, 
        transaction_type, 
        amount, 
        cumulative_amount, 
        reference_no, 
        created_at
      )
    VALUES (
          v_source_transaction_id,
          p_source_pocket_id,
          p_user_id,
          'Transfer Out'::enum_transaction_type, 
          p_amount,
          v_new_source_balance,
          v_reference_no,  
          NOW()
      );

    INSERT INTO transaction_logs (
        xid, 
        pocket_id, 
        entity_id, 
        transaction_type, 
        amount, 
        cumulative_amount, 
        reference_no, 
        created_at
      )
    VALUES (
          v_destination_transaction_id,
          p_destination_pocket_id,
          p_user_id,
          'Transfer In'::enum_transaction_type, 
          p_amount,
          v_new_destination_balance,
          v_reference_no, 
          NOW()
      );

      RETURN QUERY SELECT 
         (SELECT name FROM pockets WHERE id = p_source_pocket_id) AS source_pocket_name,
         (SELECT name FROM pockets WHERE id = p_destination_pocket_id) AS destination_pocket_name;
  ELSE
    RAISE EXCEPTION 'Insufficient funds for transfer.';
  END IF;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION log_transfer_transaction(INT, INT, NUMERIC, INT) TO app_user;
SELECT create_distributed_function(
  'create_transfer(INT, INT, NUMERIC, INT)', '$1',
);