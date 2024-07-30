CREATE OR REPLACE FUNCTION complete_group_withdrawal(
    p_group_id            INT,
    p_withdrawal_id       INT
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

    v_current_balance := get_transaction_info(p_group_id, v_pocket_id);
    IF v_current_balance < v_amount THEN
        RAISE EXCEPTION USING
          MESSAGE = 'ERR_INSUFFICIENT_FUNDS',
          ERRCODE = 'P0004';
    END IF;

    v_new_balance := v_current_balance - v_amount;
    v_reference_id := floor(random() * 1000000 + 1)::INT;
    PERFORM insert_transaction_log(
         p_group_id,
         4,
         v_pocket_id,
         v_reference_id,
         v_amount * -1,
         v_new_balance
    );
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION complete_group_withdrawal(INT, INT) TO app_user;
SELECT create_distributed_function('complete_group_withdrawal(INT, INT)', 'group_id');