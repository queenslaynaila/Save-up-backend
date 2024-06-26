CREATE OR REPLACE FUNCTION get_group_members(
    p_group_id   INT,
    p_user_id    INT
)
RETURNS TABLE(
    user_id      INT, 
    full_name    TEXT
) AS $$
DECLARE
    rec_user RECORD;
BEGIN
     IF EXISTS (
        SELECT 1
        FROM users
        WHERE id = p_user_id
        AND role = 'Admin'
    ) THEN
        RETURN QUERY
        SELECT * FROM get_active_group_members(p_group_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM group_members
        WHERE user_id = p_user_id
        AND group_id = p_group_id
        AND is_active = TRUE;
    ) THEN
        RAISE EXCEPTION 'User is not a member of the group.';
    END IF;

    RETURN QUERY
    SELECT * FROM get_active_group_members(p_group_id);
END;
$$ LANGUAGE plpgsql

GRANT EXECUTE ON FUNCTION get_group_members(INT, INT) TO app_user;
SELECT create_distributed_function(
  'get_group_members(INT, INT)', 'p_group_id'
);