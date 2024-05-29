CREATE OR REPLACE FUNCTION update_user_groups_after_invite(
    p_group_id      INT,  
    p_receiver_id   INT,
    p_status        enum_invite
)
RETURNS VOID AS $$
BEGIN
    UPDATE invitations
    SET status = p_status
    WHERE receiver_id = p_receiver_id 
    AND id = p_group_id;

    IF p_status = 'Accept'::enum_invite THEN
        INSERT INTO user_groups (user_id, group_id)
        VALUES (p_receiver_id, p_group_id);
    ELSIF p_status = 'Decline'::enum_invite THEN
        UPDATE invitations
        SET deleted_at = NOW()
        WHERE receiver_id = p_receiver_id
        AND id = p_group_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION update_user_groups_after_invite(INT, INT, enum_invite) TO app_user;
SELECT create_distributed_function(
  'update_user_groups_after_invite(INT, INT, enum_invite)', 'p_group_id'
);