CREATE OR REPLACE FUNCTION create_user_transfer(
    p_source_pocket_id        INT, 
    p_destination_pocket_id   INT, 
    p_user_id                 INT, -- The group member or a standard user doing the transfer
    p_amount                  NUMERIC(30, 2), 
    p_entity_id               INT
)
RETURNS VOID AS $$
DECLARE
  v_source_balance                NUMERIC(30, 2);
  v_destination_balance           NUMERIC (30,2);
  v_new_source_balance            NUMERIC(30, 2);
  v_new_destination_balance       NUMERIC(30, 2);
  v_reference_id                  INT;
BEGIN
  v_source_balance := get_transaction_info(p_entity_id, p_source_pocket_id);
  IF v_source_balance < p_amount THEN
    RAISE EXCEPTION USING
      MESSAGE = 'ERR_INSUFFICIENT_FUNDS',
      ERRCODE = 'P0004';
  END IF;

  v_destination_balance := get_transaction_info(p_entity_id, p_destination_pocket_id);
  v_new_source_balance =  v_source_balance - p_amount;
  v_new_destination_balance = v_destination_balance + p_amount;
  v_reference_id := floor(random() * 1000000 + 1)::INT;

   PERFORM insert_transaction_log(
        p_user_id,
        6,
        p_destination_pocket_id,
        v_reference_id,
        p_amount,
        v_new_destination_balance 
   );

    PERFORM insert_transaction_log(
       p_user_id,
       7,
       p_source_pocket_id,
       v_reference_id,
       p_amount,
       v_new_source_balance 
    );
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION create_user_transfer(INT, INT, INT, NUMERIC, INT) TO app_user;
SELECT create_distributed_function(
  'create_user_transfer(INT, INT, INT, NUMERIC, INT)', 'p_source_pocket_id'
);