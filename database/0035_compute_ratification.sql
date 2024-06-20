CREATE OR REPLACE FUNCTION compute_ratification_results(
    p_group_id       INT, 
    p_election_id    INT
)
RETURNS TABLE (
    full_name    TEXT
) AS $$
DECLARE
    v_total_members             INT;
    v_required_approval_count   INT;
    approval_counts             RECORD;
BEGIN
    SELECT COUNT(*) INTO v_total_members 
    FROM group_members 
    WHERE group_id = p_group_id 
    AND is_active = TRUE;

    v_required_approval_count := total_members / 2 + 1;  ---shld be more than 50%

    FOR approval_counts IN
        SELECT candidate_id, COUNT(*) AS approval_count
        FROM ratifications 
        WHERE group_id = p_group_id 
        AND election_id = p_election_id 
        AND is_ratified = TRUE
        GROUP BY candidate_id
    LOOP
        IF approval_counts.approval_count >= required_approval_count THEN
            INSERT INTO group_admins (group_id, election_id, user_id)
            VALUES (p_group_id, p_election_id, approval_counts.candidate_id);

            RETURN QUERY
            SELECT full_name
            FROM users
            WHERE id = approval_counts.candidate_id;
        END IF;
    END LOOP;

    UPDATE elections
    SET status = 'Closed', 
        closed_at = NOW()
    WHERE group_id = p_group_id 
    AND xid = p_election_id;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION compute_ratification_results(INT, INT) TO app_user;
SELECT create_distributed_function(
  'compute_ratification_results(INT, INT)', 'p_group_id'
);