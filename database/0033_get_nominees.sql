CREATE OR REPLACE FUNCTION get_nominated_admins(
    p_group_id   INT
)
RETURNS TABLE(
    nominee_id         INT, 
    nominee_name       TEXT,
    nominator_id       INT,
    nominator_name     TEXT, 
    created_at         TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    v_nominee_id       INT;
    v_nominee_name     TEXT;
    v_nominator_id     INT;
    v_nominator_name   TEXT;
    v_created_at       TIMESTAMP WITH TIME ZONE;
BEGIN
    FOR v_nominee_id, v_nominator_id, v_created_at IN
        SELECT nm.nominee_id, nm.nominator_id, nm.created_at
        FROM nominations nm
        WHERE nm.group_id = p_group_id  
        AND nm.revoked_at IS NULL
    LOOP
        SELECT u.full_name 
        INTO v_nominee_name
        FROM users u
        WHERE u.id = v_nominee_id;

        SELECT u.full_name 
        INTO v_nominator_name
        FROM users u
        WHERE u.id = v_nominator_id;

        RETURN QUERY
        SELECT v_nominee_id,
               v_nominee_name,
               v_nominator_id,
               v_nominator_name,
               v_created_at;
    END LOOP;
    
    RETURN;
END;
$$ LANGUAGE plpgsql;


GRANT EXECUTE ON FUNCTION get_nominated_admins(INT) TO app_user;
SELECT create_distributed_function(
  'get_nominated_admins(INT)', 'p_group_id'
);