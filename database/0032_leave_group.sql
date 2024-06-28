CREATE OR REPLACE FUNCTION leave_group(
    p_user_id     INT,
    p_group_id    INT
) 
RETURNS VOID AS $$
DECLARE
  v_member_count INT;
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM group_members
        WHERE group_id = p_group_id 
        AND user_id = p_user_id
        AND is_active = TRUE
    ) THEN
        RAISE EXCEPTION 'User is not a member of the group.';
    END IF;

    UPDATE group_members
    SET is_active = FALSE
    WHERE group_id = p_group_id 
    AND user_id = p_user_id;

    INSERT INTO group_lefts (group_id, user_id, xid, reason)
    SELECT 
        p_group_id,
        p_user_id,
        COALESCE(MAX(xid), 0) + 1,
        'Self removal'
    FROM group_lefts
    WHERE group_id = p_group_id;

    SELECT COUNT(*) INTO STRICT v_member_count
    FROM group_members
    WHERE group_id = p_group_id
    AND is_active = TRUE;

    IF v_member_count = 1 THEN
        UPDATE groups
        SET deleted_at = NOW()
        WHERE id = p_group_id;
    END IF;  
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION leave_group(INT, INT) TO app_user;
SELECT create_distributed_function(
  'leave_group(INT, INT)', 'p_group_id'
);