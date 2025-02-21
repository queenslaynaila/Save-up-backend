CREATE OR REPLACE FUNCTION create_candidate(
    p_group_id     INT,
    p_election_id  INT,
    p_candidate_id INT,
    p_user_id      INT
)
RETURNS VOID AS $$
DECLARE
    nomination_count INT;
BEGIN
    PERFORM check_grp_membership(p_group_id, p_user_id);

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

    SELECT COUNT(*) INTO nomination_count
    FROM candidates
    WHERE group_id = p_group_id
      AND election_id = p_election_id
      AND chosen_by = p_user_id;

    IF nomination_count >= 3  THEN
        RAISE EXCEPTION USING
            MESSAGE = 'ERR_NOMINATION_LIMIT_REACHED',
            ERRCODE = 'P003';
    END IF;

    INSERT INTO candidates (group_id, election_id, candidate_id, chosen_by)
    VALUES (p_group_id, p_election_id, p_candidate_id, p_user_id);

    RETURN;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION create_candidate(INT, INT, INT, INT) TO app_user;
SELECT create_distributed_function(
  'create_candidate(INT, INT, INT, INT)', 'p_group_id'
);