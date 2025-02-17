CREATE OR REPLACE FUNCTION create_candidate(
    p_group_id     INT,
    p_election_id  INT,
    p_candidate_id INT,
    p_chosen_by    INT
)
RETURNS VOID AS $$
BEGIN
    -- Check if chosen_by is an active group member
    IF NOT EXISTS (
        SELECT 1
        FROM group_members
        WHERE group_id = p_group_id
          AND user_id = p_chosen_by
          AND is_active = TRUE
    ) THEN
        RAISE EXCEPTION USING
            MESSAGE = 'ERR_NOT_ACTIVE_GROUP_MEMBER',
            ERRCODE = 'P0008';
    END IF;

    -- Check if the election is open and has not been closed
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

    -- Ensure the nomination period has not ended
    IF EXISTS (
        SELECT 1
        FROM elections
        WHERE group_id = p_group_id
          AND xid = p_election_id
          AND nomination_ends_at <= NOW()
    ) THEN
        RAISE EXCEPTION USING
            MESSAGE = 'ERR_NOMINATION_ENDED',
            ERRCODE = 'P0009';
    END IF;

    -- Insert the candidate
    INSERT INTO candidates (group_id, election_id, candidate_id, chosen_by)
    VALUES (p_group_id, p_election_id, p_candidate_id, p_chosen_by);

    RETURN;
END;
$$ LANGUAGE plpgsql;
