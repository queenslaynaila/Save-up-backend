CREATE OR REPLACE FUNCTION compute_ballot_results(
    p_group_id       INT, 
    p_election_id    INT
)
RETURNS TABLE (
    full_name    TEXT
) AS $$
DECLARE
    total_members INT;
    active_members INT;
    ballots_cast INT;
    candidate_counts RECORD;
BEGIN
    SELECT COUNT(*) INTO total_members 
    FROM group_members 
    WHERE group_id = p_group_id 
    AND is_active = TRUE;

    SELECT COUNT(DISTINCT user_id) INTO ballots_cast 
    FROM ballots 
    WHERE group_id = p_group_id 
    AND election_id = p_election_id;

    IF ballots_cast < (total_members / 2.0) THEN
        RAISE EXCEPTION 'At least 50%% of active group members must have cast their ballots.';
    END IF;

    FOR candidate_counts IN
        SELECT candidate_id, COUNT(*) AS vote_count
        FROM ballots
        WHERE group_id = p_group_id 
        AND election_id = p_election_id
        GROUP BY candidate_id
        ORDER BY vote_count DESC
        LIMIT 3
    LOOP
        INSERT INTO group_admins (group_id, election_id, user_id)
        VALUES (p_group_id, p_election_id, candidate_counts.candidate_id);

        RETURN QUERY 
        SELECT users.full_name 
        FROM users
        WHERE users.id = candidate_counts.candidate_id;
    END LOOP;

    UPDATE elections
    SET status = 'Closed', 
        closed_at = NOW()
    WHERE group_id = p_group_id 
    AND xid = p_election_id;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION compute_ballot_results(INT, INT) TO app_user;

SELECT create_distributed_function(
  'compute_ballot_results(INT, INT)', 'p_group_id'
);