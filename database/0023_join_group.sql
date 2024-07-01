CREATE OR REPLACE FUNCTION join_group(
    p_group_id      INT,
    p_user_id       INT
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO group_members (group_id, user_id)
    VALUES (p_group_id, p_user_id);

    INSERT INTO group_joins (group_id, user_id, xid)
    SELECT 
        p_group_id, 
        p_user_id,
        COALESCE(MAX(xid), 0) + 1
    FROM group_joins
    WHERE group_id = p_group_id;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION insert_into_group_members_and_join(INT, INT) TO app_user;
SELECT create_distributed_function('insert_into_group_members_and_join(INT, INT)', 'p_group_id');