CREATE OR REPLACE FUNCTION get_open_election_for_group(
    p_group_id   INT,
    p_user_id    INT
)
RETURNS TABLE(
    group_id        INT,
    election_id     INT,
    initiator_id    INT,
    type            TEXT,
    initiator_name  TEXT,
    created_at      TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    v_initiator_name      TEXT;
    v_group_id            INT;
    v_election_id         INT;
    v_initiator_id        INT;
    v_type                TEXT;
    v_created_at          TIMESTAMP WITH TIME ZONE;
BEGIN
    PERFORM check_grp_membership(p_group_id, p_user_id);
    
    SELECT e.group_id, e.xid AS election_id, e.initiator_id, e.type, e.created_at
    INTO STRICT v_group_id, v_election_id, v_initiator_id, v_type, v_created_at
    FROM elections e
    WHERE e.group_id = p_group_id
    AND e.status = 'Open'
    ORDER BY e.xid DESC
    LIMIT 1;

    SELECT u.full_name INTO STRICT v_initiator_name
    FROM users u
    WHERE u.id = initiator_id;

    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_open_election_for_group(INT, INT) TO app_user;
SELECT create_distributed_function(
  'get_open_election_for_group(INT, INT)', 'p_group_id'
);