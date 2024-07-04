CREATE OR REPLACE FUNCTION get_active_group_members(
    p_group_id   INT
)
RETURNS TABLE(
    user_id      INT, 
    full_name    TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id AS user_id, u.full_name
    FROM users u
    WHERE u.id IN (
        SELECT gm.user_id
        FROM group_members gm
        WHERE gm.group_id = p_group_id
        AND gm.is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_active_group_members(INT) TO app_user;
SELECT create_distributed_function(
  'get_active_group_members(INT)', 'p_group_id'
);