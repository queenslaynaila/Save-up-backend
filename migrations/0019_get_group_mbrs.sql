CREATE OR REPLACE FUNCTION get_group_members(
    p_group_id   INT,
    p_user_id    INT
)
RETURNS TABLE(
    user_id      INT, 
    full_name    TEXT,
    is_admin     BOOLEAN,
    joined_at    TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    v_user_role   enum_user_role;
BEGIN
    SELECT users.role INTO v_user_role
    FROM users
    WHERE users.id = p_user_id;

    IF v_user_role NOT IN ('Admin', 'Moderator') THEN 
        PERFORM check_grp_membership(p_group_id, p_user_id);
    END IF;

    RETURN QUERY
    SELECT 
        group_members.user_id,
        (SELECT user_contact_details.full_name 
         FROM user_contact_details 
         WHERE user_contact_details.id = group_members.user_id),
        EXISTS(
            SELECT 1 
            FROM group_admins 
            WHERE group_admins.group_id = p_group_id
            AND group_admins.user_id = group_members.user_id
            AND group_admins.election_id = (
                SELECT MAX(ga.election_id) 
                FROM group_admins ga
                WHERE ga.group_id = p_group_id
            )
        ) AS is_admin,
        (SELECT group_joins.created_at 
         FROM group_joins 
         WHERE group_joins.group_id = p_group_id
         AND group_joins.user_id = group_members.user_id 
         ORDER BY group_joins.xid DESC 
         LIMIT 1) AS joined_at
    FROM group_members
    WHERE group_members.group_id = p_group_id
    AND group_members.is_active = TRUE
    ORDER BY is_admin DESC;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_group_members(INT, INT) TO app_user;
SELECT create_distributed_function('get_group_members(INT, INT)', 'p_group_id');