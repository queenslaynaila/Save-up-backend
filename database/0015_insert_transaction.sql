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
        pocket_id, 
        xid, 
        transaction_type, 
        amount, 
        reference_no,
        current_balance
    )
    VALUES (
        p_entity_id,
        p_pocket_id,
        p_transaction_id,
        p_transaction_type,
        p_amount,
        p_reference_no,
        p_current_balance 
    );
END;
$$ LANGUAGE plpgsql;