CREATE OR REPLACE FUNCTION create_transfer(
    p_source_pocket_id        INT, 
    p_destination_pocket_id   INT, 
    p_user_id                 INT, -- The group member or a standard user doing the transfer
    p_amount                  NUMERIC(30, 2), 
    p_entity_id               INT
)
RETURNS VOID AS $$
DECLARE
  v_source_transaction_id         INT;
  v_source_balance                NUMERIC(30, 2);
  v_destination_transaction_id    INT;
  v_destination_balance           NUMERIC (30,2);
  v_new_source_balance            NUMERIC(30, 2);
  v_new_destination_balance       NUMERIC(30, 2);
  v_reference_id                  INT;
BEGIN 
  SELECT * FROM get_transaction_info(p_source_pocket_id, p_entity_id) 
  INTO STRICT v_source_transaction_id, v_source_balance;

  IF v_source_balance < p_amount THEN
      RAISE EXCEPTION 'Insufficient funds for transfer.';
  END IF;

  SELECT * FROM get_transaction_info(p_destination_pocket_id, p_entity_id) 
  INTO STRICT v_destination_transaction_id, v_destination_balance;

  v_new_source_balance =  v_source_balance - p_amount;
  v_new_destination_balance = v_destination_balance + p_amount;
  v_reference_id := floor(random() * 1000000 + 1)::INT;

   PERFORM insert_transaction_log(
        p_user_id,
        4,
        p_destination_pocket_id,
        v_reference_id,
        p_amount,
        v_new_destination_balance 
   );

    PERFORM insert_transaction_log(
       p_user_id,
       5,
       p_source_pocket_id,
       v_reference_id,
       p_amount,
       v_new_source_balance 
    );
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION log_transfer_transaction(INT, INT, INT, NUMERIC, INT) TO app_user;
SELECT create_distributed_function(
  'create_transfer(INT, INT, INT, NUMERIC, INT)', 'p_source_pocket_id'
);