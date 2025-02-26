CREATE OR REPLACE FUNCTION delete_pocket(
    p_entity_id INT,
    p_pocket_id INT
) 
RETURNS VOID AS $$
DECLARE
    v_current_balance NUMERIC;
BEGIN
    v_current_balance := get_transaction_info(p_entity_id, p_pocket_id);
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

GRANT EXECUTE ON FUNCTION delete_pocket(INT, INT) TO app_user;
SELECT create_distributed_function(
  'delete_pocket(INT, INT)', 'p_entity_id'
);