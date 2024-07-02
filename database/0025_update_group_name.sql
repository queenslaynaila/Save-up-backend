CREATE OR REPLACE FUNCTION update_group_name(
    p_group_id   INT,
    p_user_id    INT,
    p_new_name   TEXT
) RETURNS TABLE (
    new_name    TEXT
) AS $$
DECLARE
    v_old_name TEXT;
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM groups
        WHERE id = p_group_id
        AND deleted_at IS NULL
    ) THEN
        RAISE EXCEPTION 'ERR_INACTIVE_GROUP';
    END IF;

    PERFORM check_grp_membership(p_user_id, p_group_id);

    SELECT name INTO STRICT v_old_name
    FROM groups
    WHERE id = p_group_id;

    INSERT INTO prev_group_names (group_id, xid, name)
    SELECT 
        p_group_id,
        COALESCE(MAX(xid), 0) + 1,
        v_old_name
    FROM prev_group_names
    WHERE group_id = p_group_id;

    UPDATE groups
    SET name = p_new_name
    WHERE id = p_group_id
    AND deleted_at IS NULL
    RETURNING name INTO STRICT new_name;

    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION update_group_name(INT, INT, TEXT) TO app_user;
SELECT create_distributed_function(
  'update_group_name(INT, INT, TEXT)', 'p_group_id'
);