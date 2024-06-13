CREATE OR REPLACE FUNCTION update_invite(
    p_group_id      INT,  
    p_receiver_id   INT,
    p_status        enum_invite
)
RETURNS VOID AS $$
BEGIN
    UPDATE invitations
    SET status = p_status
    WHERE receiver_id = p_receiver_id 
    AND group_id = p_group_id;

    IF p_status = 'Accept'::enum_invite THEN
        INSERT INTO group_users (group_id, xid, user_id)
        SELECT p_group_id, 
               COALESCE(MAX(xid), 0) + 1,
               p_receiver_id
        FROM group_users
        WHERE group_id = p_group_id;
    END IF;

    IF p_status = 'Decline'::enum_invite THEN
        UPDATE invitations
        SET deleted_at = NOW()
        WHERE receiver_id = p_receiver_id
        AND group_id = p_group_id
        AND deleted_at is NULL;
    END IF;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION update_invite(INT, INT, enum_invite) TO app_user;
SELECT create_distributed_function(
  'update_invite(INT, INT, enum_invite)', 'p_group_id'
);