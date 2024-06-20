CREATE OR REPLACE FUNCTION get_group_members(
    p_group_id   INT
)
RETURNS TABLE(
    user_id      INT, 
    full_name    TEXT
) AS $$
DECLARE
    rec_user RECORD;
BEGIN
    FOR rec_user IN
        SELECT group_members.user_id
        FROM group_members
        WHERE group_members.group_id = p_group_id 
        AND group_members.is_active = TRUE
    LOOP
        RETURN QUERY
        SELECT users.id AS user_id, users.full_name
        FROM users
        WHERE users.id = rec_user.user_id;
    END LOOP;
END;
$$ LANGUAGE plpgsql

GRANT EXECUTE ON FUNCTION get_group_members(INT) TO app_user;

SELECT create_distributed_function(
  'get_group_members(INT)', 'p_group_id'
);