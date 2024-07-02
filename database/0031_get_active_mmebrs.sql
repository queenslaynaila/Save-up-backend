--Use loop to avoid repartinioning
CREATE OR REPLACE FUNCTION get_active_group_members(
    p_group_id   INT
)
RETURNS TABLE(
    user_id      INT, 
    full_name    TEXT
) AS $$
DECLARE
    rec_user    RECORD;
BEGIN
    FOR rec_user IN
        SELECT gm.user_id
        FROM group_members gm
        WHERE gm.group_id = p_group_id 
        AND gm.is_active = TRUE
    LOOP
        SELECT u.id, u.full_name INTO user_id, full_name
        FROM users u
        WHERE u.id = rec_user.user_id;

        RETURN NEXT;
    END LOOP;
    
    RETURN;
END;
$$ LANGUAGE plpgsql;