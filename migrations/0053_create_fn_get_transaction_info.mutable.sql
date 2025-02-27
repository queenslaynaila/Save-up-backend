CREATE OR REPLACE FUNCTION get_transaction_info(
    p_entity_id   INT,
    p_pocket_id   INT
)
RETURNS NUMERIC(30, 2) AS $$
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
    INTO v_current_balance;

    RETURN v_current_balance;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_transaction_info(INT, INT) TO app_user;
SELECT create_distributed_function(
  'get_transaction_info(INT, INT)', 'p_entity_id'
);