CREATE OR REPLACE FUNCTION compute_ratification_results(
    p_group_id       INT, 
    p_election_id    INT,
    p_user_id        INT
)
RETURNS TABLE (
    full_name            TEXT,
    ratification_status  BOOLEAN
) AS $$
DECLARE
    v_total_active_members       INT;
    v_required_approval_count    INT;
    v_approval_count             INT;
BEGIN
    PERFORM check_grp_membership(p_group_id, p_user_id);

    SELECT COUNT(*) INTO STRICT v_total_active_members 
    FROM group_members 
    WHERE group_id = p_group_id 
    AND is_active = TRUE;

    v_required_approval_count := v_total_active_members / 2 + 1;

    SELECT COUNT(*) INTO STRICT v_approval_count 
    FROM ratifications
    WHERE group_id = p_group_id  
    AND election_id = p_election_id
    AND is_ratified = TRUE;

    RETURN QUERY
    SELECT u.full_name,
           (v_approval_count >= v_required_approval_count) AS ratification_status
    FROM users u
    WHERE u.id IN (
        SELECT ga.user_id
        FROM group_admins ga
        WHERE ga.group_id =  p_group_id 
        AND ga.election_id = p_election_id
    );
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION compute_ratification_results(INT, INT) TO app_user;
SELECT create_distributed_function(
  'compute_ratification_results(INT, INT)', 'p_group_id'
);