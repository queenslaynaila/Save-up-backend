CREATE OR REPLACE FUNCTION get_election_results(
  p_group_id    INT, 
  p_election_id INT, 
  p_user_id     INT
)
RETURNS TABLE (
  candidate_id INT,
  full_name TEXT
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
    SELECT ga.user_id AS candidate_id, ucd.full_name
    FROM group_admins ga
    JOIN user_contact_details ucd ON ga.user_id = ucd.id
    WHERE ga.group_id = p_group_id
      AND ga.election_id = p_election_id;
END;
$$ LANGUAGE plpgsql;
