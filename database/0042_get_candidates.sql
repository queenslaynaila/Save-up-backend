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
    v_candidate_record    RECORD;
BEGIN
    SELECT role INTO STRICT v_user_role
    FROM users
    WHERE id = p_user_id;

    IF v_user_role != 'Admin' THEN
      SELECT check_grp_membership(p_user_id, p_group_id);
    END IF;

    FOR candidate_record IN
        SELECT group_id, election_id, candidate_id, created_at
        FROM candidates
        WHERE group_id = p_group_id  
        AND election_id = p_election_id
    LOOP
        RETURN QUERY
        SELECT 
            v_candidate_record.candidate_id,
            v_candidate_record.group_id,
            v_candidate_record.election_id,
            ( SELECT full_name FROM users u 
              WHERE u.id = v_candidate_record.candidate_id
            ) AS candidate_name,
            v_candidate_record.created_at;
    END LOOP;

    RETURN;
END;
$$ LANGUAGE plpgsql;


GRANT EXECUTE ON FUNCTION get_candidates(INT, INT) TO app_user;
SELECT create_distributed_function(
  'get_candidates(INT, INT)', 'p_group_id'
);