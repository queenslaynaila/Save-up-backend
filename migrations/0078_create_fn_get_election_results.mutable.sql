CREATE OR REPLACE FUNCTION get_election_results(
    p_group_id    INT, 
    p_election_id INT, 
    p_user_id     INT
)
RETURNS TABLE (
    candidate_id INT,
    full_name    TEXT
) AS $$
BEGIN
    PERFORM check_grp_membership(p_group_id, p_user_id);

    IF NOT EXISTS (
        SELECT 1
        FROM elections
        WHERE group_id = p_group_id
          AND xid = p_election_id
          AND status = 'Closed'
          AND closed_at IS NOT NULL
    ) THEN
        RAISE EXCEPTION USING
            MESSAGE = 'ERR_ELECTION_OPEN',
            ERRCODE = 'P0007';
    END IF;

    RETURN QUERY
    SELECT 
        group_admins.user_id AS candidate_id,
        user_contact_details.full_name
    FROM group_admins
    JOIN user_contact_details 
        ON user_contact_details.id = group_admins.user_id
    WHERE group_admins.group_id = p_group_id
      AND group_admins.election_id = p_election_id;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_election_results(INT, INT, INT) TO saveup_www;
SELECT create_distributed_function(
    'get_election_results(INT, INT, INT)',
    'p_group_id'
);