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
      PERFORM check_grp_membership(p_group_id, p_user_id);
    END IF;

    RETURN QUERY
    SELECT u.id AS user_id, u.full_name
    FROM user_contact_details u
    JOIN group_members gm ON u.id = gm.user_id
    WHERE gm.group_id = p_group_id
    AND gm.is_active = TRUE;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_group_members(INT, INT) TO app_user;
SELECT create_distributed_function(
  'get_group_members(INT, INT)', 'p_group_id'
);