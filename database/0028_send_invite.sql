CREATE OR REPLACE FUNCTION send_invite(
  p_phone_number        TEXT, 
  p_group_id            INT,
  p_sender_id           INT
)
RETURNS VOID AS $$
DECLARE
  v_receiver_id   INT;
BEGIN 
    SELECT id INTO STRICT v_receiver_id
    FROM user_contact_details 
    WHERE phone_number = p_phone_number; 

    INSERT INTO invitations (group_id, xid, sender_id, receiver_id)
    SELECT p_group_id, 
           COALESCE(MAX(xid), 0) + 1, 
           p_sender_id,
           v_receiver_id
    FROM invitations
    WHERE group_id = p_group_id
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION send_invite(TEXT, INT, INT) TO app_user;
SELECT create_distributed_function(
  'send_invite(TEXT, INT, INT)', 'p_group_id'
);