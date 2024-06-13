CREATE OR REPLACE FUNCTION start_election(
    p_group_id     INT,
    p_started_by   INT
)
RETURNS VOID AS $$
DECLARE
    is_admin              BOOLEAN;
    has_ongoing_election  BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM group_administrators
        WHERE group_id = p_group_id 
        AND user_id = p_started_by 
        AND revoked_at IS NULL
    ) INTO is_admin;

    IF NOT is_admin THEN
        RAISE EXCEPTION 'Only administrators can start elections';
    END IF;

    SELECT EXISTS (
        SELECT 1
        FROM elections
        WHERE group_id = p_group_id 
        AND end_at IS NULL
    ) INTO has_ongoing_election;

    IF has_ongoing_election THEN
        RAISE EXCEPTION 'The group already has an ongoing election';
    END IF;

    INSERT INTO elections (group_id, xid, started_by)
    SELECT 
        p_group_id,
        COALESCE(MAX(xid), 0) + 1,
        p_started_by
    FROM elections
    WHERE group_id = p_group_id;

    UPDATE group_administrators
    SET revoked_at = NOW()
    WHERE group_id = p_group_id;

    UPDATE nominated_administrators
    SET revoked_at = NOW()
    WHERE group_id = p_group_id;
END;
$$ LANGUAGE plpgsql;