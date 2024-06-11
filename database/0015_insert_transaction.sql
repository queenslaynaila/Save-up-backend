CREATE OR REPLACE FUNCTION insert_transaction_log(
    p_entity_id             INT,
    p_pocket_id             INT,
    p_transaction_id        INT,
    p_transaction_type      enum_transaction_type,
    p_amount                NUMERIC,
    p_reference_no          TEXT,
    p_current_balance    NUMERIC
)
RETURNS VOID AS $$
BEGIN 
    INSERT INTO transaction_logs (
        entity_id, 
        xid, 
        pocket_id, 
        transaction_type, 
        amount, 
        reference_no,
        current_balance
    )
    SELECT p_entity_id,
           COALESCE(MAX(xid), 0) + 1,
           p_pocket_id,
           p_transaction_type, 
           p_amount, 
           p_reference_no,
           p_current_balance
    WHERE entity_id = p_entity_id
END;
$$ LANGUAGE plpgsql;