CREATE OR REPLACE FUNCTION start_election(
    p_group_id     INT,
    p_initiator_id  INT
)
RETURNS VOID AS $$
BEGIN
    UPDATE nominated_administrators
    SET revoked_at = NOW()
    WHERE group_id = p_group_id;

    INSERT INTO elections (group_id, xid, started_by)
    SELECT 
        p_group_id,
        COALESCE(MAX(xid), 0) + 1,
        p_started_by
    FROM elections
    WHERE group_id = p_group_id;
END;
$$ LANGUAGE plpgsql;

SELECT create_distributed_function(
  'start_election(INT, INT)' , 'p_group_id'
);

GRANT EXECUTE ON FUNCTION start_election(INT, INT) TO app_user;