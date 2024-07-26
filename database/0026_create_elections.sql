CREATE OR REPLACE FUNCTION get_ongoing_election(
    p_group_id       INT,
    p_user_id        INT
)
RETURNS TABLE (
    group_id            INT,
    election_id         INT,
    initiator_id        INT,
    type                TEXT,
    created_at          TIMESTAMP WITH TIME ZONE,
    initiator_name      TEXT
) AS $$
DECLARE
    v_group_id              INT;
    v_election_id           INT;
    v_initiator_id          INT;
    v_type                  TEXT;
    v_created_at            TIMESTAMP WITH TIME ZONE;
    v_initiator_name   TEXT;
BEGIN
    PERFORM check_grp_membership(p_group_id, p_user_id);

    SELECT 
        elections.group_id, 
        elections.xid AS election_id, 
        elections.initiator_id, 
        elections.type,
        elections.created_at,
        user_contact_details.full_name AS initiator_name
    INTO STRICT 
        v_group_id, 
        v_election_id, 
        v_initiator_id, 
        v_type, 
        v_created_at, 
        v_initiator_name
    FROM elections
    JOIN user_contact_details 
    ON elections.initiator_id = user_contact_details.id
    WHERE elections.group_id = p_group_id
    AND elections.status = 'Open';

    RETURN QUERY 
    SELECT 
        v_group_id, 
        v_election_id, 
        v_initiator_id, 
        v_type, 
        v_created_at, 
        v_initiator_name;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_open_election_for_group(INT, INT) TO app_user;
SELECT create_distributed_function(
  'get_open_election_for_group(INT, INT)', 'p_group_id'
);