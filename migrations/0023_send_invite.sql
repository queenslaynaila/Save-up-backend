CREATE OR REPLACE FUNCTION send_invite(
    p_group_id            INT,
    p_phone_number        TEXT,
    p_sender_id           INT
) RETURNS TABLE (
    is_member    BOOLEAN,
    sender_name  TEXT,
    group_name   TEXT
) AS $$
DECLARE
    v_receiver_id   INT;
    v_sender_name   TEXT;
    v_group_name    TEXT;
    is_member       BOOLEAN;
BEGIN
    SELECT full_name INTO STRICT v_sender_name
    FROM user_contact_details
    WHERE id = p_sender_id;

    SELECT name INTO STRICT v_group_name
    FROM groups
    WHERE id = p_group_id;

    SELECT id 
    INTO v_receiver_id
    FROM user_contact_details 
    WHERE phone_number = p_phone_number;
    
    is_member := v_receiver_id IS NOT NULL;

    INSERT INTO invitations (
        group_id, 
        xid, 
        sender_id, 
        receiver_id, 
        phone_number
    )
    SELECT 
        p_group_id,
        COALESCE(MAX(xid), 0) + 1,
        p_sender_id,
        v_receiver_id,  -
        p_phone_number 
    FROM invitations
    WHERE group_id = p_group_id;

    RETURN QUERY 
    SELECT 
        is_member,
        v_sender_name,
        v_group_name;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION send_invite(INT, TEXT, INT) TO app_user;

SELECT create_distributed_function(
    'send_invite(INT, TEXT, INT)',
    'p_group_id'
);