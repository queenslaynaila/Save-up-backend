CREATE OR REPLACE FUNCTION manage_group_membership(
    p_group_id        INT,
    p_initiator_id    INT,
    p_target_id       INT DEFAULT NULL
) RETURNS TABLE (
    initiator_name TEXT,
    target_name TEXT
) AS $$
DECLARE
    v_latest_election_id INT;
    v_member_count INT;
    v_target_id INT;
BEGIN
    v_target_id := COALESCE(p_target_id, p_initiator_id);

    IF v_target_id != p_initiator_id THEN
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

        IF EXISTS (
            SELECT 1 
            FROM group_deposits
            WHERE group_id = p_group_id 
            AND user_id = v_target_id
        ) THEN
            RAISE EXCEPTION USING
                MESSAGE = 'ERR_CANT_REMOVE_USER_WITH_DEPOSITS',
                ERRCODE = 'P0006';
        END IF;
    END IF;

    UPDATE group_members
    SET is_active = FALSE
    WHERE group_id = p_group_id 
    AND user_id = v_target_id
    AND is_active = TRUE;

    -- Insert into group_lefts
    INSERT INTO group_lefts (group_id, user_id, xid, reason)
    SELECT 
        p_group_id, 
        v_target_id,
        COALESCE(MAX(xid), 0) + 1, 
        CASE 
            WHEN v_target_id != p_initiator_id THEN 'Admin removal'::enum_exit_reason
            ELSE 'Self removal'::enum_exit_reason
        END
    FROM group_lefts      
    WHERE group_id = p_group_id;

    -- Check if the group has no active members left (only for self-removal)
    IF v_target_id = p_initiator_id THEN
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

        -- Get the user's name for self-removal
        SELECT full_name 
        INTO STRICT target_name 
        FROM user_contact_details 
        WHERE id = v_target_id;

        RETURN QUERY SELECT NULL::TEXT AS initiator_name, target_name;
    ELSE
        -- Get initiator and target names for admin removal
        SELECT full_name 
        INTO STRICT initiator_name 
        FROM user_contact_details 
        WHERE id = p_initiator_id;

        SELECT full_name 
        INTO STRICT target_name 
        FROM user_contact_details 
        WHERE id = v_target_id;

        RETURN QUERY SELECT initiator_name, target_name;
    END IF;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION manage_group_membership(INT, INT, INT) TO saveup_www;
SELECT create_distributed_function(
  'manage_group_membership(INT, INT, INT)', 'p_group_id'
);