CREATE OR REPLACE FUNCTION get_group_members(
    p_group_id             INT,
    p_user_id              INT,
    p_allow_admin_access   BOOLEAN DEFAULT FALSE
) 
RETURNS TABLE ( 
    user_id                INT, 
    full_name              TEXT, 
    is_admin               BOOLEAN, 
    joined_at              TIMESTAMP WITH TIME ZONE 
) 
AS $$ 
DECLARE 
    v_user_role           enum_user_role; 
BEGIN 
    PERFORM check_grp_membership(p_group_id, p_user_id, p_allow_admin_access);

    RETURN QUERY
    SELECT 
        group_members.user_id,
        user_contact_details.full_name,
        EXISTS(
            SELECT 1 
            FROM group_admins
            WHERE group_admins.group_id = p_group_id
                AND group_admins.user_id = group_members.user_id
                AND group_admins.election_id = (
                    SELECT MAX(latest_admin.election_id) 
                    FROM group_admins latest_admin
                    WHERE latest_admin.group_id = p_group_id
                )
        ) AS is_admin,
        (
            SELECT DISTINCT ON (group_joins.user_id) group_joins.created_at 
            FROM group_joins
            WHERE group_joins.group_id = p_group_id
                AND group_joins.user_id = group_members.user_id
            ORDER BY group_joins.user_id, group_joins.xid DESC
        ) AS joined_at
    FROM group_members
    LEFT JOIN user_contact_details ON user_contact_details.id = group_members.user_id
    WHERE group_members.group_id = p_group_id
        AND group_members.is_active = TRUE
    ORDER BY is_admin DESC;
END; 
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_group_members(INT, INT, BOOLEAN) TO saveup_www;
SELECT create_distributed_function(
    'get_group_members(INT, INT, BOOLEAN)', 
    'p_group_id'
);