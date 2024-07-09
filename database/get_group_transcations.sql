CREATE OR REPLACE FUNCTION get_group_transactions(
    p_pocket_id   INT,
    p_user_id     INT,
    p_group_id    INT
)
RETURNS TABLE (
    transaction_id     INT,
    transaction_type   TEXT,
    amount             NUMERIC(30, 2),
    balance            NUMERIC(30, 2),
    created_at         TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    PERFORM check_grp_membership(p_user_id, p_group_id);

    RETURN QUERY
    SELECT
        transactions.xid AS transaction_id,
        transaction_types.slug AS transaction_type,
        transactions.delta AS amount,
        transactions.balance,
        transactions.created_at
    FROM
        transactions
    JOIN
        transaction_types ON transactions.type_id = transaction_types.id
    WHERE
        transactions.entity_id = p_group_id
    AND transactions.pocket_id = p_pocket_id;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_group_transactions(INT, INT, INT) TO app_user;
SELECT create_distributed_function('get_group_transactions', 'p_pocket_id');