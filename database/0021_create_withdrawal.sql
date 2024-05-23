CREATE OR REPLACE FUNCTION create_withdrawal(
    p_pocket_id        INT,
    p_user_id          INT,
    p_amount           NUMERIC(30, 2), 
    p_entity_id        INT
)
RETURNS VOID AS $$
DECLARE
    v_reference_no         TEXT;
    v_new_cumulative       NUMERIC(30, 2);
    v_pocket_type          TEXT;
    v_target_at            TIMESTAMP;
    v_transaction_id       INT;
    v_current_balance        NUMERIC(30, 2);
BEGIN 
    SELECT 
        COALESCE(MAX(xid) + 1, 1) AS v_transaction_id,
        COALESCE((SELECT cumulative_amount
                FROM transaction_logs
                WHERE pocket_id = p_pocket_id
                ORDER BY xid DESC
                LIMIT 1), 0) AS v_current_balance
        INTO STRICT v_transaction_id, v_current_balance
    FROM transaction_logs
    WHERE pocket_id = p_pocket_id
    AND entity_id = p_entity_id;

    SELECT pocket_type, target_at
    INTO v_pocket_type, v_target_at
    FROM pockets
    WHERE pockets.xid = p_pocket_id
    AND pockets.entity_id = p_entity_id;

    IF (v_pocket_type = 'Standard Pocket' AND v_current_balance >= p_amount) OR 
       (v_pocket_type = 'Locked Pocket' AND v_current_balance >= p_amount AND v_target_at <= NOW()) THEN
        INSERT INTO withdrawals (
            pocket_id, 
            xid,
            entity_id,
            amount
        )
        SELECT 
            p_pocket_id,
            COALESCE((SELECT MAX(xid) + 1 FROM withdrawals WHERE pocket_id = p_pocket_id), 1),
            p_entity_id,
            p_amount
        ;

        v_new_cumulative =  v_current_balance - p_amount;
        v_reference_no = 'WITHDRAW' || substr(md5(random()::text), 1, 5);

        INSERT INTO transaction_logs (
            xid, 
            pocket_id, 
            entity_id, 
            transaction_type, 
            amount, 
            cumulative_amount, 
            reference_no, 
            created_at
        )
        VALUES (
            v_transaction_id,
            p_pocket_id,
            p_entity_id,
            'Withdrawal'::enum_transaction_type,
            p_amount,
            v_new_cumulative,
            v_reference_no,
            NOW()
        );
    ELSE
        RAISE EXCEPTION 'Insufficient funds or conditions not met for withdrawal.';
    END IF;
END;
$$ LANGUAGE plpgsql;


GRANT EXECUTE ON FUNCTION create_withdrawal(INT, INT, NUMERIC, INT) TO app_user;