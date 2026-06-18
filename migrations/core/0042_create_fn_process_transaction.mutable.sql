CREATE OR REPLACE FUNCTION process_transaction(
    p_entity_id INT,
    p_type_slug enum_transaction_type,
    p_pocket_id INT,
    p_amount NUMERIC
)
RETURNS INT AS $$
DECLARE
    v_current_balance NUMERIC;
    v_new_balance     NUMERIC;
    v_reference_id    TEXT;
    v_type_id         INT;
    v_transaction_id  INT;
    v_target_amount   NUMERIC;
BEGIN
    PERFORM pg_advisory_xact_lock(p_entity_id);

    SELECT id
    INTO STRICT v_type_id
    FROM transaction_types
    WHERE slug = p_type_slug;

    SELECT
        COALESCE((
            SELECT balance
            FROM transactions
            WHERE pocket_id = p_pocket_id
                AND entity_id = p_entity_id
                ORDER BY xid DESC
                LIMIT 1
         ), 0)
    INTO STRICT v_current_balance;

    IF p_amount < 0 AND v_current_balance < ABS(p_amount) THEN
        RAISE EXCEPTION USING
            MESSAGE = 'ERR_INSUFFICIENT_FUNDS',
            ERRCODE = 'P0004';
    END IF;

    v_new_balance := v_current_balance + p_amount;
    v_reference_id := upper(substring(p_type_slug::TEXT FROM 1 FOR 3)) || floor(random() * 1000000 + 1)::TEXT;

    INSERT INTO transactions (
        entity_id,
        xid,
        type_id,
        pocket_id,
        reference_id,
        delta,
        balance,
        currency
    )
    SELECT
        p_entity_id,
        COALESCE((SELECT MAX(xid) FROM transactions WHERE entity_id = p_entity_id), 0) + 1,
        v_type_id,
        p_pocket_id,
        v_reference_id,
        p_amount,
        v_new_balance,
        (SELECT currency FROM pockets WHERE entity_id = p_entity_id AND xid = p_pocket_id)
    RETURNING xid INTO v_transaction_id;

    SELECT target_amount
    INTO STRICT v_target_amount
    FROM pockets
    WHERE xid = p_pocket_id
      AND entity_id = p_entity_id;

    IF p_amount > 0 AND v_new_balance >= v_target_amount THEN
        UPDATE pockets
        SET status = 'Completed'::enum_status,
            completed_at = NOW()
        WHERE xid = p_pocket_id
          AND entity_id = p_entity_id
          AND status = 'In Progress'::enum_status;
    END IF;

    RETURN v_transaction_id;

END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION process_transaction(
    INT, enum_transaction_type, INT, NUMERIC
) TO saveup_www;

SELECT create_distributed_function(
    'process_transaction(INT, enum_transaction_type, INT, NUMERIC)',
    'p_entity_id'
);
