CREATE OR REPLACE FUNCTION get_active_group_members(
    p_group_id   INT
)
RETURNS TABLE(
    user_id      INT, 
    full_name    TEXT
) AS $$
BEGIN
    FOR rec_user IN
        SELECT group_members.user_id
        FROM group_members
        WHERE group_members.group_id = p_group_id 
        AND group_members.is_active = TRUE;
    LOOP
        RETURN QUERY
        SELECT users.id AS user_id, users.full_name
        FROM users
        WHERE users.id = rec_user.user_id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;