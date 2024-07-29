CREATE OR REPLACE FUNCTION get_ongoing_election(
    p_group_id       INT,
    p_user_id        INT
)
RETURNS TABLE (
    group_id            INT,
    election_id         INT,
    type                TEXT,
    initiator_id        INT,
    initiator_name      TEXT,
    created_at          TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    PERFORM check_grp_membership(p_group_id, p_user_id);

    RETURN QUERY
        SELECT
            elections.group_id,
            elections.xid AS election_id,
            elections.type,
            elections.initiator_id,
            user_contact_details.full_name AS initiator_name,
            elections.created_at
        FROM elections
            JOIN user_contact_details
                ON elections.initiator_id = user_contact_details.id
        WHERE elections.group_id = p_group_id
          AND elections.status = 'Open';
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_ongoing_election(INT, INT) TO app_user;
SELECT create_distributed_function(
  'get_ongoing_election(INT, INT)', 'p_group_id'
);