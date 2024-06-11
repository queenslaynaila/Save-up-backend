CREATE OR REPLACE FUNCTION get_group_members(
    p_group_id   INT
)
RETURNS TABLE(
    user_id      INT, 
    full_name    TEXT, 
    joined_at    TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    rec_user RECORD;
BEGIN
    FOR rec_user IN
        SELECT ug.user_id, ug.joined_at
        FROM group_users ug
        WHERE ug.group_id = p_group_id 
        AND ug.left_at IS NULL
    LOOP
        RETURN QUERY
        SELECT u.id AS user_id, u.full_name, rec_user.joined_at
        FROM users u
        WHERE u.id = rec_user.user_id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_group_members(INT) TO app_user;
SELECT create_distributed_function(
  'get_group_members(INT)', 'p_group_id'
);