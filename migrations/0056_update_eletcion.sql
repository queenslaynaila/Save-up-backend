CREATE OR REPLACE FUNCTION update_election(
    p_group_id INT,
    p_election_id INT,
    p_status TEXT,
    p_nomination_ends_at   TIMESTAMP WITH TIME ZONE,
    p_user_id INT
)
RETURNS VOID AS $$
BEGIN
    PERFORM check_grp_membership(p_group_id, p_user_id);
     
    UPDATE elections
    SET status = COALESCE(p_status, status),
        nomination_ends_at = COALESCE(p_nomination_ends_at, nomination_ends_at)
    WHERE group_id = p_group_id
      AND xid = p_election_id
      AND status != 'Closed';    
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION update_election(INT, INT, TEXT, TIMESTAMP WITH TIME ZONE, INT) TO app_user;