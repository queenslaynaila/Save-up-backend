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
  SELECT COUNT(*) INTO STRICT v_ballot_count 
  FROM ballots
  WHERE ballots.user_id = p_user_id
  AND ballots.group_id = p_group_id
  AND ballots.election_id = p_election_id;
  
  IF v_ballot_count >= 3 THEN
    RAISE EXCEPTION 'You have already cast your maximum of three votes for this group election.';
  END IF;
  
  INSERT INTO ballots (group_id, election_id, candidate_id, user_id)
  VALUES (p_group_id, p_election_id, p_candidate_id, p_user_id); 
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION create_ballot(INT, INT, INT, INT) TO app_user;
SELECT create_distributed_function(
  'create_ballot(INT, INT, INT, INT)', 'p_group_id'
);