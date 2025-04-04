CREATE OR REPLACE FUNCTION delete_pocket(
    p_entity_id INT,
    p_pocket_id INT
) 
RETURNS VOID AS $$
DECLARE
    v_current_balance NUMERIC;
BEGIN
    SELECT
        COALESCE((SELECT balance
                FROM transactions
                WHERE pocket_id = p_pocket_id
                AND entity_id = p_entity_id
                ORDER BY xid DESC
                LIMIT 1), 0)
    INTO STRICT v_current_balance;

    IF v_current_balance > 0 THEN
        RAISE EXCEPTION USING
            MESSAGE = 'ERR_CANT_DELETE_PKT_WITH_DEPOSITS',
            ERRCODE = 'P0006';
    END IF;

    UPDATE pockets
    SET deleted_at = NOW()
    WHERE xid = p_pocket_id
      AND entity_id = p_entity_id
      AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION delete_pocket(INT, INT) TO saveup_www;
SELECT create_distributed_function(
    'delete_pocket(INT, INT)',
    'p_entity_id'
);