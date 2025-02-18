CREATE OR REPLACE FUNCTION get_group_members(
    p_group_id INT,
    p_user_id INT
) 
RETURNS TABLE( 
    user_id INT, 
    full_name TEXT, 
    is_admin BOOLEAN, 
    joined_at TIMESTAMP WITH TIME ZONE 
) 
AS $$ 
DECLARE 
    v_user_role enum_user_role; 
BEGIN 
    SELECT users.role INTO v_user_role 
    FROM users 
    WHERE users.id = p_user_id;

    IF v_user_role NOT IN ('Admin', 'Moderator') THEN 
        PERFORM check_grp_membership(p_group_id, p_user_id);
    END IF;

    RETURN QUERY
    SELECT 
        gm.user_id,
        uc.full_name,
        EXISTS(
            SELECT 1 
            FROM group_admins ga
            WHERE ga.group_id = p_group_id
              AND ga.user_id = gm.user_id
              AND ga.election_id = (
                  SELECT MAX(ga2.election_id) 
                  FROM group_admins ga2
                  WHERE ga2.group_id = p_group_id
              )
        ) AS is_admin,
        (
            SELECT DISTINCT ON (gj.user_id) gj.created_at 
            FROM group_joins gj
            WHERE gj.group_id = p_group_id
              AND gj.user_id = gm.user_id
            ORDER BY gj.user_id, gj.xid DESC
        ) AS joined_at
    FROM group_members gm
    LEFT JOIN user_contact_details uc ON uc.id = gm.user_id
    WHERE gm.group_id = p_group_id
      AND gm.is_active = TRUE
    ORDER BY is_admin DESC; 
END; 
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_group_members(INT, INT) TO app_user;
SELECT create_distributed_function('get_group_members(INT, INT)', 'p_group_id');