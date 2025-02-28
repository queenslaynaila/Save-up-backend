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
    SELECT users.role
    INTO STRICT v_user_role
    FROM users
    WHERE users.id = p_user_id;

    IF v_user_role != 'Admin' THEN
        PERFORM check_grp_membership(p_group_id, p_user_id);
    END IF;
    
    RETURN QUERY
        SELECT user_contact_details.id AS candidate_id,
               user_contact_details.full_name
        FROM candidates
        INNER JOIN user_contact_details
            ON user_contact_details.id = candidates.candidate_id
        WHERE candidates.group_id = p_group_id
            AND candidates.election_id = p_election_id;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_candidates(INT, INT, INT) TO saveup_www;
SELECT create_distributed_function(
  'get_candidates(INT, INT, INT)', 'p_group_id'
);