CREATE OR REPLACE FUNCTION get_transaction_info(
    p_pocket_id   INT,
    p_entity_id   INT
)
RETURNS TABLE (
    v_transaction_id   INT,
    v_current_balance  NUMERIC
) AS $$
BEGIN
    SELECT 
        COALESCE(MAX(xid) + 1, 1) AS v_transaction_id,
        COALESCE((SELECT cumulative_amount
                FROM transaction_logs
                WHERE pocket_id = p_pocket_id
                AND entity_id = p_entity_id
                ORDER BY xid DESC
                LIMIT 1), 0) AS v_current_balance
    INTO STRICT v_transaction_id, v_current_balance
    FROM transaction_logs
    WHERE pocket_id = p_pocket_id
    AND entity_id = p_entity_id;
   
    RETURN QUERY SELECT v_transaction_id, v_current_balance;
END;
$$ LANGUAGE plpgsql;