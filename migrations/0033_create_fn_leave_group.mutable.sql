CREATE OR REPLACE FUNCTION leave_group(
    p_group_id    INT,
    p_user_id     INT
) 
RETURNS TABLE (
  name TEXT
) AS $$
DECLARE
    v_member_count INT;
    v_user_name TEXT;
BEGIN
    UPDATE group_members
    SET is_active = FALSE
    WHERE group_id = p_group_id
    AND user_id = p_user_id
    AND is_active = TRUE;

    INSERT INTO group_lefts (group_id, user_id, xid, reason)
    SELECT
        p_group_id,
        p_user_id,
        COALESCE(MAX(xid), 0) + 1,
        'Self removal'::enum_exit_reason
    FROM group_lefts
    WHERE group_id = p_group_id;

    SELECT COUNT(*)
    INTO STRICT v_member_count
    FROM group_members
    WHERE group_id = p_group_id
    AND is_active = TRUE;

    IF v_member_count = 0 THEN
        UPDATE groups
        SET deleted_at = NOW()
        WHERE id = p_group_id
        AND deleted_at IS NULL;
    END IF;

    SELECT full_name
    INTO STRICT v_user_name
    FROM user_contact_details
    WHERE id = p_user_id;

    RETURN QUERY SELECT v_user_name;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION leave_group(INT, INT) TO saveup_www;
SELECT create_distributed_function(
  'leave_group(INT, INT)', 'p_group_id'
);