CREATE OR REPLACE FUNCTION create_election_candidates(
    p_group_id INT,
    p_election_id INT,
    p_candidate_ids INT [],
    p_user_id INT
) RETURNS VOID AS $$
DECLARE
    v_nomination_count INT;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM elections 
        WHERE group_id = p_group_id 
          AND xid = p_election_id 
          AND status = 'Open' 
          AND nomination_ends_at > NOW()
    ) THEN
        RAISE EXCEPTION USING 
            MESSAGE = 'ERR_ELECTION_CLOSED_OR_NOMINATION_ENDED', 
            ERRCODE = 'P0007';
    END IF;

    SELECT COUNT(*) INTO v_nomination_count
    FROM candidates
    WHERE group_id = p_group_id 
      AND election_id = p_election_id 
      AND chosen_by = p_user_id;

    IF v_nomination_count + array_length(p_candidate_ids, 1) > 3 THEN
        RAISE EXCEPTION USING 
            MESSAGE = 'ERR_NOMINATION_LIMIT_REACHED', 
            ERRCODE = 'P0003';
    END IF;

    INSERT INTO candidates (group_id, election_id, candidate_id, chosen_by)
    SELECT p_group_id, p_election_id, unnest(p_candidate_ids), p_user_id
    ON CONFLICT DO NOTHING;

    RETURN;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION create_candidates(
    INT,
    INT,
    INT [],
    INT
) TO saveup_www;
SELECT create_distributed_function(
    'create_candidates(
        INT, 
        INT, 
        INT[], 
        INT
    )'
);
