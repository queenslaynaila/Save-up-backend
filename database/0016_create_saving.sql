CREATE OR REPLACE FUNCTION create_saving(
    p_user_id      INT, 
    p_pocket_id    INT, 
    p_amount       NUMERIC,
    p_entity_id    INT
)
RETURNS TABLE (
    name  TEXT
) AS $$
DECLARE
    v_total_savings  NUMERIC;
    v_transaction_id  INT;
    v_target_amount  NUMERIC;
    v_new_cumulative NUMERIC;
    v_reference_no   TEXT;
BEGIN 
    INSERT INTO savings (entity_id, xid, pocket_id, user_id, amount)
    SELECT entity_id,
           COALESCE(MAX(xid) + 1, 1),
           pocket_id,
           user_id,
           amount
    FROM savings
    WHERE entity_id = p_entity_id
    AND pocket_id = p_pocket_id
    GROUP BY entity_id,pocket_id,user_id,amount;

    SELECT 
        COALESCE(MAX(xid) + 1, 1) AS v_transaction_id,
        COALESCE((SELECT cumulative_amount
                FROM transaction_logs
                WHERE pocket_id = p_pocket_id
                ORDER BY xid DESC
                LIMIT 1), 0) AS v_total_savings
        INTO STRICT v_transaction_id, v_total_savings
    FROM transaction_logs
    WHERE pocket_id = p_pocket_id
    AND entity_id = p_entity_id;

    SELECT target_amount INTO STRICT v_target_amount  
    FROM pockets 
    WHERE entity_id = p_entity_id 
    AND xid = p_pocket_id;

    IF v_total_savings >= v_target_amount THEN
        UPDATE pockets
        SET status = 'Completed'::enum_status,
          completed_at = NOW()
        WHERE entity_id = p_entity_id
        AND xid = p_pocket_id;
    END IF;

    v_new_cumulative = COALESCE(v_total_savings, 0) + p_amount;
    v_reference_no = 'SAVE' || nextval('saving_transaction_seq');

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
        'Saving'::enum_transaction_type,
        p_amount,
        v_new_cumulative,
        v_reference_no,
        NOW()
    );

    RETURN QUERY SELECT pockets.name FROM pockets WHERE xid = p_pocket_id;
END;
$$ LANGUAGE plpgsql;


GRANT EXECUTE ON FUNCTION create_saving(INT, INT, NUMERIC, INT) TO app_user;