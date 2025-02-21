CREATE OR REPLACE FUNCTION get_election_results(
  p_group_id    INT, 
  p_election_id INT, 
  p_user_id     INT
)
RETURNS JSON AS $$
DECLARE
  v_results JSON;
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

    SELECT JSON_AGG(
        JSON_BUILD_OBJECT(
            'candidate_id', group_admins.user_id,
            'full_name', user_contact_details.full_name
        )
    ) INTO v_results
    FROM group_admins
    JOIN user_contact_details ON group_admins.user_id = user_contact_details.id
    WHERE group_admins.group_id = p_group_id
      AND group_admins.election_id = p_election_id;

    RETURN v_results;
END;
$$ LANGUAGE plpgsql;
