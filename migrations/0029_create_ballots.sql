CREATE OR REPLACE FUNCTION create_ballot(
  p_group_id      INT, 
  p_election_id   INT, 
  p_candidate_id  INT, 
  p_user_id       INT
)
RETURNS VOID AS $$
DECLARE
  v_ballot_count   INT;
  v_total_members  INT;
  v_total_votes    INT;
BEGIN
    -- Ensure election is still open
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

    -- Check if user has exceeded voting limit
    SELECT COUNT(*) INTO STRICT v_ballot_count
    FROM ballots
    WHERE user_id = p_user_id
        AND group_id = p_group_id
        AND election_id = p_election_id;
  
    IF v_ballot_count >= 3 THEN
        RAISE EXCEPTION USING
            MESSAGE = 'ERR_MAX_VOTE_CAST',
            ERRCODE = 'P0003';
    END IF;

    INSERT INTO ballots (group_id, election_id, candidate_id, user_id)
    VALUES (p_group_id, p_election_id, p_candidate_id, p_user_id);

    SELECT COUNT(*) INTO v_total_members
    FROM group_members
    WHERE group_id = p_group_id
      AND is_active = TRUE;

    SELECT COUNT(DISTINCT user_id) INTO v_total_votes
    FROM ballots
    WHERE group_id = p_group_id
      AND election_id = p_election_id;

    IF v_total_votes >= v_total_members THEN
        UPDATE elections
        SET status = 'Closed', closed_at = NOW()
        WHERE group_id = p_group_id
          AND xid = p_election_id;
    END IF;

    RETURN;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION create_ballot(INT, INT, INT, INT) TO app_user;
SELECT create_distributed_function(
  'create_ballot(INT, INT, INT, INT)', 'p_group_id'
);