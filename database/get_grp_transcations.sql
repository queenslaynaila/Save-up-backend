CREATE OR REPLACE FUNCTION get_group_transactions(
    p_group_id        INT,
    p_user_id         INT,
    p_pocket_id       INT
) RETURNS TABLE (
    transaction_id     INT,
    transaction_type   INT,
    delta              NUMERIC,
    balance            NUMERIC,
    transaction_date   TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    v_user_role enum_user_role;
BEGIN
    SELECT role INTO v_user_role
    FROM users
    WHERE id = p_user_id;

    IF v_user_role != 'Admin' THEN
        IF NOT EXISTS (
            SELECT 1
            FROM group_members
            WHERE user_id = p_user_id
            AND group_id = p_group_id
            AND is_active = TRUE
        ) THEN
            RAISE EXCEPTION 'User is not a member of the group.';
        END IF;
    END IF;

    RETURN QUERY
    SELECT
        t.xid AS transaction_id,
        t.type_id AS transaction_type,
        t.delta,
        t.balance,
        t.created_at AS transaction_date
    FROM transactions t
    WHERE t.entity_id = p_group_id
    AND t.pocket_id = p_pocket_id;  
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_group_transactions(INT, INT) TO app_user;
SELECT create_distributed_function('get_group_transactions(INT, INT)', 'p_group_id');
