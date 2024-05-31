CREATE OR REPLACE FUNCTION create_saving(
    p_entity_id    INT,
    p_user_id      INT, 
    p_pocket_id    INT, 
    p_amount       NUMERIC
)
RETURNS TABLE (
    name  TEXT
) AS $$
DECLARE
    v_current_balance  NUMERIC;
    v_transaction_id   INT;
    v_target_amount    NUMERIC;
    v_new_balance      NUMERIC;
    v_reference_no     TEXT;
BEGIN 
    INSERT INTO savings (entity_id, xid, user_id, pocket_id, amount)
    SELECT 
            p_entity_id, 
            COALESCE(MAX(xid), 0) + 1, 
            p_user_id, 
            p_pocket_id, 
            p_amount 
    FROM savings 
    WHERE entity_id = p_entity_id;

    SELECT * FROM get_transaction_info(p_pocket_id, p_entity_id) 
    INTO STRICT v_transaction_id, v_current_balance;

    SELECT pockets.target_amount INTO STRICT v_target_amount  
    FROM pockets 
    WHERE entity_id = p_entity_id 
    AND xid = p_pocket_id;
    
    IF v_current_balance >= v_target_amount THEN
        UPDATE pockets
        SET status = 'Completed'::enum_status,
          completed_at = NOW()
        WHERE entity_id = p_entity_id
        AND xid = p_pocket_id;
    END IF;

    v_new_balance = v_current_balance + p_amount;
    v_reference_no = substr(md5(random()::text), 1, 5);

    PERFORM insert_transaction_log(
        p_entity_id,
        p_pocket_id,
        v_transaction_id,
        'Saving'::enum_transaction_type,
        p_amount,
        v_reference_no,
        v_new_balance
    );

    RETURN QUERY SELECT pockets.name FROM pockets WHERE xid = p_pocket_id AND entity_id = p_entity_id;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION create_saving(INT, INT, NUMERIC, INT) TO app_user;
SELECT create_distributed_function(
  'create_saving(INT, INT, NUMERIC, INT)', 'p_entity_id'
);