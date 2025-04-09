CREATE OR REPLACE FUNCTION create_ballot(
    p_group_id      INT,
    p_election_id   INT,
    p_candidate_ids INT[],
    p_user_id       INT
) RETURNS VOID AS $$
DECLARE
    v_ballot_count  INT;
    v_total_members INT;
    v_total_voters  INT;
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM elections
        WHERE group_id = p_group_id
          AND xid = p_election_id
          AND status = 'Open'
    ) THEN
        RAISE EXCEPTION USING
            MESSAGE = 'ERR_ELECTION_CLOSED_OR_CANCELLED',
            ERRCODE = 'P0007';
    END IF;

    SELECT COUNT(*) INTO v_ballot_count
    FROM ballots
    WHERE user_id = p_user_id
      AND group_id = p_group_id
      AND election_id = p_election_id;

    IF v_ballot_count + array_length(p_candidate_ids, 1) > 3 THEN
        RAISE EXCEPTION USING
            MESSAGE = 'ERR_MAX_VOTE_CAST',
            ERRCODE = 'P0003';
    END IF;

    INSERT INTO ballots (
        group_id,
        election_id,
        candidate_id,
        user_id
    )
    SELECT
        p_group_id,
        p_election_id,
        unnest(p_candidate_ids),
        p_user_id;

    SELECT COUNT(*)
    INTO v_total_members
    FROM group_members
    WHERE group_id = p_group_id
      AND is_active = TRUE;

    SELECT COUNT(DISTINCT user_id)
    INTO v_total_voters
    FROM ballots
    WHERE group_id = p_group_id
      AND election_id = p_election_id;

    IF v_total_voters >= (v_total_members / 2) THEN
        UPDATE elections
        SET status = 'Closed',
            closed_at = NOW()
        WHERE group_id = p_group_id
          AND xid = p_election_id;

        INSERT INTO group_admins (group_id, election_id, user_id)
        SELECT p_group_id, p_election_id, candidate_id
        FROM (
                 SELECT candidate_id
                 FROM ballots
                 WHERE group_id = p_group_id
                   AND election_id = p_election_id
                 GROUP BY candidate_id
                 ORDER BY COUNT(*) DESC
                 LIMIT 3
             ) AS top_candidates;
    END IF;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION create_ballot(INT, INT, INT[], INT) TO saveup_www;
SELECT create_distributed_function(
    'create_ballot(INT, INT, INT[], INT)',
    'p_group_id'
);