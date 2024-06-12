CREATE OR REPLACE FUNCTION get_nominated_admins(
    p_group_id   INT
)
RETURNS TABLE(
    nominee_id         INT, 
    nominee_name          TEXT,
    nominator_id       INT,
    nominator_name     TEXT, 
    created_at         TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    nominee_record RECORD;
BEGIN
    SELECT nm.user_id AS nominee_id, 
           nm.nominator_id, 
           nm.created_at
    INTO nominee_record
    FROM nominated_administrators nm
    WHERE nm.group_id = p_group_id  
      AND nm.revoked_at IS NULL;

    LOOP
        SELECT u.full_name AS nominee_name
        INTO nominee_record
        FROM users u
        WHERE u.id = nominee_record.nominee_id;

        SELECT u.full_name AS nominator_name
        INTO nominee_record
        FROM users u
        WHERE u.id = nominee_record.nominator_id;

        RETURN NEXT
            nominee_record(nominee_id, nominee_name, nominator_id, nominator_name, created_at);
    END LOOP;

    RETURN; 
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_nominated_admins(INT) TO app_user;
SELECT create_distributed_function(
  'get_nominated_admins(INT)', 'p_group_id'
);