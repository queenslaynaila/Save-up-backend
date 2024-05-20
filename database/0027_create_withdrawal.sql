CREATE SEQUENCE withdrawal_transaction_seq START 1;

CREATE OR REPLACE FUNCTION create_withdrawal(
    p_pocket_id        INT,
    p_user_id          INT,
    p_amount           NUMERIC(30, 2), 
    p_entity_id        INT
)
RETURNS VOID AS $$
DECLARE
    v_current_balance      NUMERIC(30, 2),
    v_reference_no         TEXT,
    v_new_cumulative       NUMERIC(30, 2),
    v_pocket_type          TEXT,
    v_target_at            TIMESTAMP,
BEGIN 
    SELECT COALESCE(cumulative_amount, 0) INTO v_current_balance
    FROM transaction_logs
    WHERE pocket_id = p_pocket_id
    ORDER BY transaction_id DESC
    LIMIT 1;

    SELECT t.cumulative_amount, p.pocket_type, p.target_at
    INTO v_current_balance, v_pocket_type, v_target_at
    FROM (
        SELECT tl.cumulative_amount
        FROM transaction_logs tl
        WHERE tl.pocket_id = p_pocket_id
        ORDER BY tl.created_at DESC
        LIMIT 1
    ) AS t
    CROSS JOIN (
        SELECT pk.pocket_type, pk.target_at
        FROM pockets pk
        WHERE pk.id = p_pocket_id
    ) AS p;

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

        v_new_cumulative = COALESCE(v_current_balance, 0) - p_amount;
        v_reference_no = 'WITHDRAW' || nextval('withdrawal_transaction_seq');

        INSERT INTO transaction_logs (
            transaction_id, 
            pocket_id, 
            entity_id, 
            transaction_type, 
            amount, 
            cumulative_amount, 
            reference_no, 
            created_at
        )
        SELECT 
            COALESCE((SELECT MAX(transaction_id) + 1 FROM transaction_logs WHERE pocket_id = p_pocket_id), 1),
            p_pocket_id,
            p_entity_id,
            'Withdrawal'::enum_transaction_type,
            p_amount,
            v_new_cumulative,
            v_reference_no,
            NOW()
        ;
    ELSE
        RAISE EXCEPTION 'Insufficient funds or conditions not met for withdrawal.';
    END IF;
END
$$ LANGUAGE plpgsql;