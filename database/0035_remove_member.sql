CREATE OR REPLACE FUNCTION remove_user_from_group(
    p_group_id        INT,
    p_initiator_id    INT,
    p_target_id       INT
) RETURNS VOID AS $$
DECLARE
    v_latest_election_id INT;
BEGIN
    PERFORM check_grp_membership(p_group_id, p_user_id);

    IF EXISTS (
        SELECT 1 FROM group_deposits
        WHERE group_id = p_group_id 
        AND user_id = p_target_id
    ) THEN
        RAISE EXCEPTION USING
            MESSAGE = 'ERR_CANT_REMOVE_USER_WITH_DEPOSITS',
            ERRCODE = 'P0006';
    END IF;

    SELECT MAX(xid)
    INTO STRICT v_latest_election_id
    FROM elections
    WHERE group_id = p_group_id;

    IF NOT EXISTS (
        SELECT 1
        FROM group_admins
        WHERE group_id = p_group_id
        AND election_id = v_latest_election_id
        AND user_id = p_initiator_id
    ) THEN
        RAISE EXCEPTION USING 
            MESSAGE = 'ERR_NOT_GROUP_ADMIN',
            ERRCODE = 'P0002';
    END IF;

    UPDATE group_members
    SET is_active = FALSE
    WHERE group_id = p_group_id 
    AND user_id = p_target_id;

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

GRANT EXECUTE ON FUNCTION remove_user_from_group(INT, INT, INT) TO app_user;
SELECT create_distributed_function('remove_user_from_group(INT, INT, INT)', 'p_group_id');