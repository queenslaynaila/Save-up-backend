CREATE OR REPLACE FUNCTION create_election(
    p_group_id        INT,
    p_initiator_id    INT,
    p_type            enum_election_type
)
RETURNS VOID AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM elections
        WHERE group_id = p_group_id
        AND status = 'Open'
    ) THEN
        RAISE EXCEPTION USING
          MESSAGE = 'ERR_ONGOING_ELECTION_EXISTS',
          ERRCODE = 'P0007';
    END IF;

    INSERT INTO elections (group_id, xid, initiator_id, type)
    SELECT 
        p_group_id,
        COALESCE(MAX(xid), 0) + 1,
        p_initiator_id,
        p_type
    FROM elections
    WHERE group_id = p_group_id;
    
    RETURN;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION create_election(INT, INT, enum_election_type) TO app_user;
SELECT create_distributed_function(
  'create_election(INT, INT, enum_election_type)', 'p_group_id'
);