CREATE OR REPLACE FUNCTION complete_group_withdrawal(
    p_withdrawal_id       INT,
    p_group_id            INT
) 
RETURNS VOID AS $$
DECLARE
    v_pocket_id           INT;
    v_amount              NUMERIC;
    v_current_balance     NUMERIC;
    v_new_balance         NUMERIC;
    v_reference_id        INT;
BEGIN
    SELECT pocket_id, amount
    INTO STRICT v_pocket_id, v_amount
    FROM group_withdrawal_requests
    WHERE group_id = p_group_id
    AND xid = p_withdrawal_id;
 
    SELECT * FROM get_transaction_info(v_pocket_id, p_group_id) 
    INTO STRICT v_current_balance;

    v_new_balance := v_current_balance - v_amount;
    v_reference_id := floor(random() * 1000000 + 1)::INT;
       
    INSERT INTO transactions (entity_id, xid, type_id, pocket_id, reference_id, delta, balance)
        SELECT
            p_group_id,
            COALESCE(MAX(xid), 0) + 1, 
            3,
            v_pocket_id,
            v_reference_id,
            v_amount,
            v_new_balance
        FROM transactions
    WHERE entity_id = p_group_id;  
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION complete_group_withdrawal(INT, INT) TO app_user;
SELECT create_distributed_function('complete_group_withdrawal(INT, INT)', 'group_id');