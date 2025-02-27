CREATE OR REPLACE FUNCTION ratify_election(
    p_group_id       INT,
    p_election_id    INT,
    p_user_id        INT,
    p_is_ratified    BOOLEAN
) RETURNS VOID AS $$
DECLARE
    v_total_ratifers       INT;
    v_total_ratifications  INT;
    v_total_approvals      INT;
BEGIN
    PERFORM check_grp_membership(p_group_id, p_user_id);

    IF NOT EXISTS (
        SELECT 1
        FROM elections
        WHERE group_id = p_group_id
          AND xid = p_election_id
          AND status = 'Open'
          AND closed_at IS NULL
    ) THEN
        RAISE EXCEPTION USING
            MESSAGE = 'ERR_ELECTION_CLOSED',
            ERRCODE = 'P0007';
    END IF;

    INSERT INTO ratifications (
        group_id,
        election_id,
        user_id,
        is_ratified
    ) VALUES (
        p_group_id,
        p_election_id,
        p_user_id,
        p_is_ratified
    ) ON CONFLICT (group_id, election_id, user_id) 
      DO NOTHING;

    SELECT COUNT(*) INTO v_total_ratifers
    FROM group_members
    WHERE group_id = p_group_id
      AND is_active = TRUE;

    SELECT COUNT(DISTINCT user_id) 
    INTO v_total_ratifications
    FROM ratifications
    WHERE group_id = p_group_id
      AND election_id = p_election_id;

    SELECT COUNT(*) INTO v_total_approvals
    FROM ratifications
    WHERE group_id = p_group_id
      AND election_id = p_election_id
      AND is_ratified = TRUE;

    IF v_total_approvals >= (v_total_ratifers / 2) THEN
        UPDATE elections
        SET status = 'Closed',
            closed_at = NOW()
        WHERE group_id = p_group_id
          AND xid = p_election_id;

        INSERT INTO group_admins (
            group_id,
            election_id,
            user_id
        )
        SELECT 
            c.group_id,
            c.election_id,
            c.candidate_id
        FROM candidates c
        WHERE c.group_id = p_group_id
          AND c.election_id = p_election_id
        ON CONFLICT (group_id, election_id, user_id) 
        DO NOTHING;
    END IF;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION ratify_election(INT, INT, INT, BOOLEAN) TO saveup_www;