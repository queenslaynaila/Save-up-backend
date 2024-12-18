CREATE OR REPLACE FUNCTION create_saving(
    p_user_id      INT,      
    p_amount       NUMERIC,  
    p_pocket_id    INT,    
    p_group_id     INT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_current_balance  NUMERIC;
    v_new_balance      NUMERIC;
    v_reference_id     INT;
    v_transaction_id   INT;
BEGIN
    v_current_balance := get_transaction_info(COALESCE(p_group_id, p_user_id), p_pocket_id);
    v_new_balance := v_current_balance + p_amount;
    v_reference_id := floor(random() * 1000000 + 1)::INT;

    v_transaction_id := insert_transaction_log(
        COALESCE(p_group_id, p_user_id),
        1,
        p_pocket_id,
        v_reference_id,
        p_amount,
        v_new_balance
    );

    IF p_group_id IS NOT NULL THEN
        INSERT INTO group_deposits (group_id, deposit_id, user_id)
        VALUES (p_group_id, v_transaction_id, p_user_id);
    END IF;

    UPDATE pockets
    SET status = 'Completed'::enum_status,
        completed_at = NOW()
    WHERE entity_id = COALESCE(p_group_id, p_user_id) 
      AND xid = p_pocket_id
      AND status = 'In Progress'::enum_status
      AND v_current_balance >= pockets.target_amount;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION create_saving(INT, NUMERIC, INT, INT) TO app_user;

SELECT create_distributed_function(
  'create_saving(INT, NUMERIC, INT, INT)', 
  'p_user_id'
);