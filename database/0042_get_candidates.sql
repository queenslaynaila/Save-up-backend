CREATE OR REPLACE FUNCTION get_candidates(
    p_group_id      INT,
    p_election_id   INT,
    p_user_id       INT
)
RETURNS TABLE(
    candidate_id         INT, 
    group_id             INT,
    election_id          INT,
    candidate_name       TEXT,
    created_at           TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    v_user_role   enum_user_role;
    candidate_record    RECORD;
BEGIN
    SELECT role INTO STRICT v_user_role
    FROM users
    WHERE id = p_user_id;

    IF v_user_role != 'Admin' THEN
      PERFORM check_grp_membership(p_user_id, p_group_id);
    END IF;

    FOR candidate_record IN
        SELECT c.group_id, c.election_id, c.candidate_id, c.created_at
        FROM candidates c
        WHERE c.group_id = p_group_id  
        AND c.election_id = p_election_id
    LOOP
        RETURN QUERY
        SELECT 
            candidate_record.candidate_id,
            candidate_record.group_id,
            candidate_record.election_id,
            ( SELECT u.full_name FROM users u 
              WHERE u.id = candidate_record.candidate_id
            ) AS candidate_name,
            candidate_record.created_at;
    END LOOP;

    RETURN;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_candidates(INT, INT) TO app_user;
SELECT create_distributed_function(
  'get_candidates(INT, INT)', 'p_group_id'
);