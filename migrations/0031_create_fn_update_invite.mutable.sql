CREATE OR REPLACE FUNCTION update_invite(
    p_invite_id     INT,
    p_group_id      INT,  
    p_receiver_id   INT,
    p_status        enum_invite
)
RETURNS VOID AS $$
BEGIN
    UPDATE invitations
    SET status = p_status
    WHERE receiver_id = p_receiver_id 
        AND group_id = p_group_id
        AND xid = p_invite_id
        AND deleted_at is NULL;

    IF p_status = 'Accept'::enum_invite THEN
        PERFORM join_group( p_group_id, p_receiver_id );
    END IF;

    IF p_status = 'Decline'::enum_invite THEN
        UPDATE invitations
        SET deleted_at = NOW(),
            status = p_status
        WHERE receiver_id = p_receiver_id
            AND group_id = p_group_id
            AND deleted_at is NULL;
    END IF;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION update_invite(INT, INT, INT, enum_invite) TO saveup_www;
SELECT create_distributed_function(
  'update_invite(INT, INT, INT, enum_invite)', 'p_group_id'
);