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

    INSERT INTO invitations (id, sender_id, receiver_id)
    VALUES( p_group_id , p_sender_id, v_receiver_id); 
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION send_group_invite(TEXT, INT, INT) TO app_user;
SELECT create_distributed_function(
  'send_group_invite(TEXT, INT, INT)', 'p_group_id',
  collocate_with := 'invitations'
);