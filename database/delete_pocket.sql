CREATE OR REPLACE FUNCTION delete_pocket(
    p_pocket_id INT,
    p_entity_id INT
) 
RETURNS VOID AS $$
BEGIN
    SELECT * FROM get_transaction_info(pocket_id, p_entity_id) 
    INTO STRICT v_current_balance;

    SELECT EXISTS (
        SELECT 1
        FROM pocket_transactions
        WHERE pocket_id = p_pocket_id
        AND entity_id = p_entity_id
    ) INTO v_has_funds;

     IF v_current_balance <> 0 THEN
        RAISE EXCEPTION 'Cannot delete pocket because has funds';
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
  'delete_pocket((INT, INT)', 'p_entity_id'
);