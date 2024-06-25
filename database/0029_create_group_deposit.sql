CREATE OR REPLACE FUNCTION create_group_deposit(
    p_group_id     INT,
    p_user_id      INT, 
    p_pocket_id    INT, 
    p_type_id      INT,
    p_amount       NUMERIC
)
RETURNS VOID AS $$
DECLARE
    v_current_balance  NUMERIC;
    v_target_amount    NUMERIC;
    v_new_balance      NUMERIC;
    v_reference_id     INT;
     v_transaction_id   INT;
BEGIN 
    SELECT * FROM get_transaction_info(p_pocket_id, p_group_id) 
    INTO STRICT v_current_balance;

    SELECT pockets.target_amount INTO STRICT v_target_amount  
    FROM pockets 
    WHERE entity_id = p_group_id 
    AND xid = p_pocket_id;
    
    IF v_current_balance >= v_target_amount THEN
        UPDATE pockets
        SET status = 'Completed'::enum_status,
            completed_at = NOW()
        WHERE entity_id = p_group_id
        AND xid = p_pocket_id;
    END IF;

    v_new_balance = v_current_balance + p_amount;
    v_reference_id := floor(random() * 1000000 + 1)::INT;

    SELECT insert_transaction_log(
        p_group_id,
        p_type_id,
        p_pocket_id,
        v_reference_id,
        p_amount,
        v_new_balance
    ) INTO v_transaction_id;


    INSERT INTO group_deposits (group_id, deposit_id, user_id)
    VALUES (p_group_id, v_transaction_id, p_user_id);
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION create_group_deposit(INT, INT, INT, INT, NUMERIC) TO app_user;
SELECT create_distributed_function(
  'create_group_deposit(INT, INT, INT, INT, NUMERIC)', 'p_user_id'
);