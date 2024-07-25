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
    v_current_balance := get_transaction_info(p_user_id, p_pocket_id);

    v_new_balance := v_current_balance + p_amount;
    v_reference_id := floor(random() * 1000000 + 1)::INT;

    SELECT pockets.target_amount 
    INTO STRICT v_target_amount  
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

GRANT EXECUTE ON FUNCTION create_saving(INT, INT, NUMERIC) TO app_user;
SELECT create_distributed_function(
  'create_saving(INT, INT, NUMERIC)', 'p_user_id'
);