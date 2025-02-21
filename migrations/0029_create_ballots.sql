CREATE OR REPLACE FUNCTION create_ballot(
  p_group_id            INT, 
  p_election_id         INT, 
  p_candidate_id        INT, 
  p_user_id             INT
)
RETURNS VOID AS $$
DECLARE
  v_ballot_count   INT;
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM elections
        WHERE group_id = p_group_id
          AND status = 'Open'
          AND xid = p_election_id
          AND closed_at IS NULL
    ) THEN
        RAISE EXCEPTION USING
            MESSAGE = 'ERR_ELECTION_CLOSED',
            ERRCODE = 'P0007';
    END IF;

    SELECT COUNT(*) INTO STRICT v_ballot_count
    FROM ballots
    WHERE user_id = p_user_id
        AND group_id = p_group_id
        AND election_id = p_election_id;
  
   IF v_ballot_count >= 1 THEN
      RAISE EXCEPTION USING
         MESSAGE = 'ERR_MAX_VOTE_CAST',
         ERRCODE = 'P0003';
   END IF;
  
   INSERT INTO ballots (group_id, election_id, candidate_id, user_id)
   VALUES (p_group_id, p_election_id, p_candidate_id, p_user_id);
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION create_ballot(INT, INT, INT, INT) TO app_user;
SELECT create_distributed_function(
  'create_ballot(INT, INT, INT, INT)', 'p_group_id'
);