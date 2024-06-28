CREATE OR REPLACE FUNCTION remove_user_from_group(
    initiator_id INT,
    target_id INT,
    group_id INT
) RETURNS VOID AS $$
DECLARE
    initiator_is_admin BOOLEAN;
    target_has_deposits BOOLEAN;
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM group_members
        WHERE group_id = p_group_id 
        AND user_id = p_target_id
        AND is_active = TRUE
    ) THEN
        RAISE EXCEPTION 'User is not a member of the group.';
    END IF;

    IF NOT EXISTS (
       SELECT 1 FROM group_admins
       WHERE group_id = group_id 
       AND user_id = initiator_id
    ) THEN
        RAISE EXCEPTION 'Only group admins can remove members.';
    END IF;
   
    IF EXISTS (
        SELECT 1 FROM group_deposits
        WHERE group_id = group_id 
        AND user_id = target_id
    ) THEN
        RAISE EXCEPTION 'Cannot remove user because they have deposits in the group.';
    END IF;

    UPDATE group_members
    SET is_active = FALSE
    WHERE group_id = group_id 
    AND user_id = target_id;

    INSERT INTO group_lefts (group_id, user_id, xid, reason)
    SELECT 
        p_group_id, 
        p_target_id,
        COALESCE(MAX(xid), 0) + 1, 
        'Admin Removal'
    FROM group_lefts      
    WHERE group_id = p_group_id
END;
$$ LANGUAGE plpgsql;
