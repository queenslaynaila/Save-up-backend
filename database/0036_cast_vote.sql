CREATE OR REPLACE FUNCTION cast_vote(
    p_group_id      INT,
    p_voter_id      INT,
    p_nominee_id    INT,
    p_election_id   INT,
    p_vote          BOOLEAN
) RETURNS VOID AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM elections
        WHERE group_id = p_group_id
          AND id = p_election_id
          AND end_at IS NULL
    ) THEN
        RAISE EXCEPTION 'The specified election is not ongoing or does not exist.';
    END IF;

    INSERT INTO nomination_approvals (group_id, voter_id, nominee_id, election_id, vote)
    VALUES (p_group_id, p_voter_id, p_nominee_id, p_election_id, p_vote);
END;
$$ LANGUAGE plpgsql;

SELECT create_distributed_function(
  'cast_vote(INT, INT, INT, INT, BOOLEAN)' , 'p_group_id'
);

GRANT EXECUTE ON FUNCTION cast_vote(INT, INT, INT, INT, BOOLEAN) TO app_user;