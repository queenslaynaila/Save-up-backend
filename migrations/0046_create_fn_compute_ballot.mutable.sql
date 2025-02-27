CREATE OR REPLACE FUNCTION compute_ballot_results(
    p_group_id       INT, 
    p_election_id    INT,
    p_user_id        INT
)
RETURNS TABLE (
    full_name    TEXT
) AS $$
DECLARE
    v_total_members     INT;
    v_ballots_cast      INT;
    rec                 RECORD; 
BEGIN
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
            ERRCODE = 'P0005';
    END IF;

    PERFORM check_grp_membership(p_group_id, p_user_id);
    
    SELECT COUNT(*) 
    INTO STRICT v_total_members 
    FROM group_members 
    WHERE group_id = p_group_id
        AND is_active = TRUE;

    SELECT COUNT(DISTINCT user_id) 
    INTO STRICT v_ballots_cast 
    FROM ballots 
    WHERE group_id = p_group_id 
        AND election_id = p_election_id;

    IF v_ballots_cast < (v_total_members / 2.0) THEN
        RAISE EXCEPTION USING 
            MESSAGE = 'ERR_INSUFFICIENT_VOTES',
            ERRCODE = 'P0004';
    END IF;

    FOR rec IN
        SELECT candidate_id
        FROM ballots
        WHERE group_id = p_group_id 
            AND election_id = p_election_id
        GROUP BY candidate_id
        ORDER BY COUNT(*) DESC
        LIMIT 3
    LOOP
        INSERT INTO group_admins (group_id, election_id, user_id)
        VALUES (p_group_id, p_election_id, rec.candidate_id);

        RETURN QUERY 
        SELECT u.full_name 
        FROM user_contact_details u
        WHERE u.id = rec.candidate_id;
    END LOOP;

    UPDATE elections
    SET status = 'Closed', 
        closed_at = NOW()
    WHERE group_id = p_group_id 
        AND xid = p_election_id;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION compute_ballot_results(INT, INT, INT) TO app_user;
SELECT create_distributed_function(
  'compute_ballot_results(INT, INT, INT)', 'p_group_id'
);