CREATE OR REPLACE FUNCTION start_election(
    p_group_id     INT,
    p_started_by   INT
)
RETURNS VOID AS $$
DECLARE
    is_admin              BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM group_administrators
        WHERE group_id = p_group_id 
        AND user_id = p_started_by 
        AND revoked_at IS NULL
    ) INTO is_admin;

    IF NOT is_admin THEN
        RAISE EXCEPTION 'Only group administrators can start elections';
    END IF;

    UPDATE group_administrators
    SET revoked_at = NOW()
    WHERE group_id = p_group_id;

    UPDATE nominated_administrators
    SET revoked_at = NOW()
    WHERE group_id = p_group_id;

    INSERT INTO elections (group_id, xid, started_by)
    SELECT 
        p_group_id,
        COALESCE(MAX(xid), 0) + 1,
        p_started_by
    FROM elections
    WHERE group_id = p_group_id;
END;
$$ LANGUAGE plpgsql;