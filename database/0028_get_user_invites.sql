CREATE OR REPLACE FUNCTION get_user_invites(
    p_receiver_id  INT
)
RETURNS TABLE (
    group_id       INT,
    group_name     TEXT,
    sender_id      INT,
    sender_name    TEXT,
    created_at     TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
        SELECT 
            i.sender_id,
            i.group_id,
            u.full_name AS sender_name,
            g.name AS group_name,
            i.created_at
        FROM invitations i
        JOIN groups g ON i.group_id = g.id
        JOIN user_contact_details u ON i.sender_id = u.id
        WHERE i.receiver_id = p_receiver_id
        AND i.status = 'Pending';
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_user_invites(INT) TO app_user;
SELECT create_distributed_function(
    'get_user_invites(INT)', 'p_receiver_id'
);