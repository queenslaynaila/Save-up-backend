CREATE OR REPLACE FUNCTION create_saving(
    p_user_id      INT, 
    p_pocket_id    INT, 
    p_amount       NUMERIC
)
RETURNS VOID AS $$
DECLARE
    v_current_balance  NUMERIC;
    v_target_amount    NUMERIC;
    v_new_balance      NUMERIC;
    v_reference_id     INT;
BEGIN 
    SELECT * FROM get_transaction_info(p_pocket_id, p_user_id) 
    INTO STRICT v_current_balance;

    v_new_balance = v_current_balance + p_amount;
    v_reference_id := floor(random() * 1000000 + 1)::INT;

    SELECT pockets.target_amount INTO STRICT v_target_amount  
    FROM pockets 
    WHERE entity_id = p_user_id 
    AND xid = p_pocket_id;
    
    IF v_current_balance >= v_target_amount THEN
        UPDATE pockets
        SET status = 'Completed'::enum_status,
            completed_at = NOW()
        WHERE entity_id = p_user_id
        AND xid = p_pocket_id;
    END IF;

    PERFORM insert_transaction_log(
        p_user_id,
        1,
        p_pocket_id,
        v_reference_id,
        p_amount,
        v_new_balance
    );
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION create_user_deposit(INT, INT, NUMERIC) TO app_user;
SELECT create_distributed_function(
  'create_user_deposit(INT, INT, NUMERIC)', 'p_user_id'
);