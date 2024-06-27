CREATE OR REPLACE FUNCTION get_group_members(
    p_group_id   INT,
    p_user_id    INT
)
RETURNS TABLE(
    user_id      INT, 
    full_name    TEXT
) AS $$
DECLARE
    v_user_role   enum_user_role;
BEGIN
    SELECT role INTO STRICT v_user_role
    FROM users
    WHERE id = p_user_id;

--Admin user can view grp members regardless of not being a member
    IF v_user_role != 'Admin' THEN 
        IF IF NOT EXISTS (
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
    SELECT * FROM get_active_group_members(p_group_id);
END;
$$ LANGUAGE plpgsql

GRANT EXECUTE ON FUNCTION get_group_members(INT, INT) TO app_user;
SELECT create_distributed_function(
  'get_group_members(INT, INT)', 'p_group_id'
);