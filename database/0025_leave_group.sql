CREATE OR REPLACE FUNCTION leave_group(
    p_user_id     INT,
    p_group_id    INT,
    p_reason      enum_exit_reason
) RETURNS VOID AS $$
BEGIN
    UPDATE group_members
    SET is_active = FALSE
    WHERE group_id = p_group_id 
    AND user_id = p_user_id;

    INSERT INTO group_lefts (group_id, user_id, xid, reason)
    SELECT 
        p_group_id,
        p_user_id,
        COALESCE(MAX(xid), 0) + 1,
        p_reason
    FROM group_lefts
    WHERE group_id = p_group_id;
END;
$$ LANGUAGE plpgsql;
