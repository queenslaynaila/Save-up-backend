CREATE OR REPLACE FUNCTION get_candidates(
    p_group_id      INT,
    p_election_id   INT,
    p_user_id       INT
)
RETURNS TABLE(
    candidate_id    INT, 
    full_name       TEXT
) AS $$
DECLARE
    v_user_role   enum_user_role;
BEGIN
    SELECT role INTO STRICT v_user_role
    FROM users
    WHERE id = p_user_id;

    IF v_user_role != 'Admin' THEN
      PERFORM check_grp_membership(p_group_id, p_user_id);
    END IF;
    
    RETURN QUERY
    SELECT ucd.id AS candidate_id, ucd.full_name
    FROM candidates c
    JOIN user_contact_details ucd ON ucd.id = c.candidate_id
    WHERE c.group_id = p_group_id  
    AND c.election_id = p_election_id;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_candidates(INT, INT) TO app_user;
SELECT create_distributed_function(
  'get_candidates(INT, INT)', 'p_group_id'
);