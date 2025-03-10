CREATE OR REPLACE FUNCTION insert_transaction_log(
    p_entity_id             INT,
    p_type_id               INT,
    p_pocket_id             INT,
    p_reference_id          INT,
    p_amount                NUMERIC,
    p_current_balance       NUMERIC
)
RETURNS INT AS $$
DECLARE
    v_transaction_id INT;
BEGIN 
    INSERT INTO transactions (
        entity_id, 
        xid, 
        type_id,
        pocket_id,
        reference_id,
        delta, 
        balance
    )
    SELECT 
        p_entity_id,
        COALESCE((SELECT MAX(xid) FROM transactions WHERE entity_id = p_entity_id), 0) + 1,
        p_type_id,
        p_pocket_id,
        p_reference_id,
        p_amount, 
        p_current_balance
    RETURNING xid INTO STRICT v_transaction_id;

    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION insert_transaction_log(
    INT, INT, INT, INT, NUMERIC, NUMERIC
) TO saveup_www;
SELECT create_distributed_function(
  'insert_transaction_log(INT, INT, INT, INT, NUMERIC, NUMERIC)', 
  'p_entity_id'
);