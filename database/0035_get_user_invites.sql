CREATE OR REPLACE FUNCTION get_user_invites(
    p_receiver_id  INT
)
RETURNS TABLE (
    group_id INT,
    group_name TEXT,
    sender_id INT,
    sender_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    v_invitation_record RECORD;
     v_sender_name TEXT;
    v_group_name TEXT;
BEGIN
    FOR v_invitation_record IN
        SELECT 
            i.group_id,
            i.sender_id,
            i.created_at
        FROM invitations i
        WHERE i.receiver_id = p_receiver_id
    LOOP
        SELECT u.full_name
        INTO v_sender_name
        FROM users u
        WHERE u.id = v_invitation_record.sender_id;

        SELECT g.name
        INTO v_group_name
        FROM groups g
        WHERE g.id = v_invitation_record.group_id;

        sender_id = v_invitation_record.sender_id;
        sender_name = v_sender_name;
        group_id = v_invitation_record.group_id;
        group_name = v_group_name;
        created_at = v_invitation_record.created_at;

        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_user_invites(INT) TO app_user;
SELECT create_distributed_function(
    'get_user_invites(INT)', 'p_receiver_id'
);