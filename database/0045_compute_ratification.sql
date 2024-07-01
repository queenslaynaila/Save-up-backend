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
    v_total_active_members             INT;
    v_required_approval_count   INT;
    v_approval_count            RECORD;
BEGIN
  SELECT check_grp_membership(p_user_id, p_group_id);

    SELECT COUNT(*) INTO v_total_active_members 
    FROM group_members 
    WHERE group_id = p_group_id 
    AND is_active = TRUE;

    v_required_approval_count := v_total_active_members / 2 + 1;  ---shld be more than 50%

    FOR approval_counts IN
        SELECT COUNT(*) INTO STRICT v_approval_count 
        FROM ratifications
        WHERE group_id =  p_group_id  
        AND election_id =  p_election_id
        AND is_ratified = TRUE;
    LOOP
        IF approval_counts.v_approval_count >= v_required_approval_count THEN
            RETURN QUERY
            SELECT u.full_name, TRUE
            FROM users u
            JOIN group_admins ga ON u.id = ga.user_id
            WHERE ga.group_id = p_group_id
            AND ga.election_id = p_election_id;
        ELSE
            RETURN QUERY
            SELECT u.full_name, FALSE
            FROM users u
            JOIN group_admins ga ON u.id = ga.user_id
            WHERE ga.group_id = p_group_id
            AND ga.election_id = p_election_id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION compute_ratification_results(INT, INT) TO app_user;
SELECT create_distributed_function(
  'compute_ratification_results(INT, INT)', 'p_group_id'
);