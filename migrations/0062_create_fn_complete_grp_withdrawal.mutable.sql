CREATE OR REPLACE FUNCTION complete_group_withdrawal(
    p_group_id        INT,
    p_request_id      INT
)
RETURNS INT AS $$
DECLARE
    v_pocket_id           INT;
    v_amount              NUMERIC;
    v_current_balance     NUMERIC;
    v_new_balance         NUMERIC;
    v_reference_id        TEXT;
    v_transaction_id      INT;
BEGIN
    SELECT pocket_id, amount
    INTO STRICT v_pocket_id, v_amount
    FROM debit_requests
    WHERE group_id = p_group_id
    AND xid = p_request_id;

    v_current_balance := get_transaction_info(p_group_id, v_pocket_id);
    IF v_current_balance < v_amount THEN
        RAISE EXCEPTION USING
          MESSAGE = 'ERR_INSUFFICIENT_FUNDS',
          ERRCODE = 'P0004';
    END IF;

    v_new_balance := v_current_balance - v_amount;
    v_reference_id := 'TXN' || floor(random() * 1000000 + 1)::TEXT;

    v_transaction_id := insert_transaction_log(
         p_group_id,
         4,
         v_pocket_id,
         v_reference_id,
         v_amount,
         v_new_balance
    );

    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION complete_group_withdrawal(INT, INT) TO saveup_www;
SELECT create_distributed_function(
  'complete_group_withdrawal(INT, INT)', 'p_group_id'
);
