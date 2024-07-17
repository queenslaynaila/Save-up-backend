CREATE OR REPLACE FUNCTION create_user_withdrawal(
    p_user_id      INT,
    p_pocket_id    INT,
    p_amount       NUMERIC
)
RETURNS VOID AS $$
DECLARE
    v_current_balance      NUMERIC(30, 2);
    v_pocket_type          TEXT;
    v_target_at            TIMESTAMP WITH TIME ZONE;
    v_new_balance          NUMERIC(30, 2);
    v_reference_id         TEXT;
BEGIN
    SELECT current_balance
    INTO STRICT v_current_balance
    FROM get_transaction_info(p_pocket_id, p_user_id);

    IF v_current_balance < p_amount THEN
        RAISE EXCEPTION USING
            MESSAGE = 'ERR_INSUFFICIENT_FUNDS',
            ERRCODE = 'P0004';
    END IF;

    SELECT pocket_type, target_at
    INTO STRICT v_pocket_type, v_target_at
    FROM pockets
    WHERE pockets.xid = p_pocket_id
    AND pockets.entity_id = p_user_id;

    IF v_pocket_type = 'Locked' AND v_target_at > NOW() THEN
        RAISE EXCEPTION USING
            MESSAGE = 'ERR_FUNDS_LOCKED',
            ERRCODE = 'P0005';
    END IF;

    v_new_balance = v_current_balance - p_amount;
    v_reference_id := floor(random() * 1000000 + 1)::INT;

    PERFORM insert_transaction_log(
        p_user_id,
        3,
        p_pocket_id,
        v_reference_id,
        p_amount,
        v_new_balance
    );
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION create_user_withdrawal(INT, INT, NUMERIC) TO app_user;
SELECT create_distributed_function(
  'create_user_withdrawal(INT, INT, NUMERIC)', 'p_user_id'
);