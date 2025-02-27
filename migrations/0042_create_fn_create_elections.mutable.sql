CREATE OR REPLACE FUNCTION create_election(
    p_group_id              INT,
    p_initiator_id          INT,
    p_type                  enum_election_type,
    p_nomination_ends_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '2 days',
    p_candidates            INT[] DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_election_id INT;
BEGIN
    PERFORM check_grp_membership(p_group_id, p_initiator_id);

    IF EXISTS (
        SELECT 1 FROM elections
        WHERE group_id = p_group_id
          AND status = 'Open'
          AND closed_at IS NULL
    ) THEN
        RAISE EXCEPTION USING MESSAGE = 'ERR_ONGOING_ELECTION_EXISTS', ERRCODE = 'P0004';
    END IF;

    INSERT INTO elections (group_id, xid, initiator_id, type, nomination_ends_at)
    SELECT
        p_group_id,
        COALESCE(MAX(xid), 0) + 1,
        p_initiator_id,
        p_type,
        p_nomination_ends_at
    FROM elections
    WHERE group_id = p_group_id
    RETURNING xid INTO STRICT v_election_id;

    IF p_type = 'Ratification' THEN
        IF p_candidates IS NULL OR array_length(p_candidates, 1) < 1 OR array_length(p_candidates, 1) > 3 THEN
            RAISE EXCEPTION USING MESSAGE = 'ERR_INVALID_CANDIDATE_COUNT', ERRCODE = 'P0005';
        END IF;

        INSERT INTO candidates (group_id, election_id, candidate_id, chosen_by, created_at)
        SELECT p_group_id, v_election_id, unnest(p_candidates), p_initiator_id, NOW();
    END IF;

END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION create_election(INT, INT, enum_election_type, TIMESTAMP WITH TIME ZONE, INT[]) TO saveup_www;
