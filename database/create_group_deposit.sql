CREATE OR REPLACE FUNCTION create_group_deposit(
    p_group_id      INT,
    p_user_id       INT,
    p_pocket_id     INT,
    p_amount        NUMERIC(30, 2)
) 
RETURNS VOID AS $$
DECLARE
    v_current_balance   NUMERIC(30, 2);
    v_reference_id      INT;
    v_transaction_id    INT;
    v_new_balance       NUMERIC(30, 2);
BEGIN
    SELECT v_current_balance
    INTO STRICT v_current_balance
    FROM get_transaction_info(p_pocket_id, p_group_id);
    
    v_reference_id := floor(random() * 1000000 + 1)::INT;
    v_new_balance := v_current_balance + p_amount;

    INSERT INTO transactions(entity_id, xid, type_id, pocket_id, reference_id, delta, balance)
    SELECT
        p_group_id,
        COALESCE(MAX(xid), 0) + 1,
        1,  
        p_pocket_id,
        v_reference_id,
        p_amount,
        v_new_balance,
    FROM transactions
    WHERE entity_id = p_group_id
    AND pocket_id = p_pocket_id
    RETURNING xid INTO v_transaction_id;

    INSERT INTO group_deposits(group_id, deposit_id, user_id)
    VALUES(p_group_id, v_transaction_id, p_user_id);
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION create_group_deposit(INT, INT, INT, NUMERIC) TO app_user;
SELECT create_distributed_function('create_group_deposit(INT, INT, INT, NUMERIC)', 'p_group_id');