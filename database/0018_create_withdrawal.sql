CREATE OR REPLACE FUNCTION create_withdrawal(
    p_entity_id        INT   -- 0wner of the pocket. Either a group or a user
    p_pocket_id        INT,
    p_user_id          INT,    --Group member or user proccessing the withdrawal
    p_amount           NUMERIC(30, 2), 
)
RETURNS TABLE (
    name  TEXT
) AS $$
DECLARE
    v_transaction_id       INT;
    v_current_balance      NUMERIC(30, 2);
    v_pocket_type          TEXT;
    v_target_at            TIMESTAMP WITH TIME ZONE;
    v_new_balance          NUMERIC(30, 2);
    v_reference_no         TEXT;
BEGIN 
    SELECT * FROM get_transaction_info(p_pocket_id, p_entity_id) 
    INTO STRICT v_transaction_id, v_current_balance;

    SELECT pocket_type, target_at
    INTO STRICT v_pocket_type, v_target_at
    FROM pockets
    WHERE pockets.xid = p_pocket_id
    AND pockets.entity_id = p_entity_id;

    IF (v_pocket_type = 'Standard' AND v_current_balance >= p_amount) OR 
       (v_pocket_type = 'Locked' AND v_current_balance >= p_amount AND v_target_at <= NOW()) THEN
        INSERT INTO withdrawals (
            entity_id,
            xid, 
            pocket_id,
            user_id,
            amount
        )
        SELECT 
            p_entity_id,
            COALESCE(MAX(xid), 0) + 1, 
            p_pocket_id,
            p_user_id,
            p_amount
        FROM withdrawals
        WHERE entity_id = p_entity_id;

        v_new_balance =  v_current_balance - p_amount;
        v_reference_no = substr(md5(random()::text), 1, 5);

        PERFORM insert_transaction_log(
            p_entity_id,
            p_pocket_id,
            v_transaction_id,
            'Withdrawal'::enum_transaction_type,
            p_amount,
            v_reference_no,
            v_new_balance
        );
    ELSE
        RAISE EXCEPTION 'Insufficient funds or conditions not met for withdrawal.';
    END IF;

    RETURN QUERY SELECT pockets.name FROM pockets WHERE xid = p_pocket_id AND entity_id = p_entity_id;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION create_withdrawal(INT, INT, NUMERIC, INT) TO app_user;
SELECT create_distributed_function(
  'create_withdrawal(INT, INT, NUMERIC, INT)', 'p_entity_id'
);
