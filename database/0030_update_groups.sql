CREATE OR REPLACE FUNCTION update_group_details(
    p_group_id INT,
    p_new_name TEXT
) RETURNS TABLE (
    name    TEXT
) AS $$
DECLARE
    v_old_name TEXT;
BEGIN
    SELECT name INTO v_old_name
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
    RETURNING name;
END;
$$ LANGUAGE plpgsql;