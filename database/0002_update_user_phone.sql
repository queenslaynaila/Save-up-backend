CREATE OR REPLACE FUNCTION update_user_phone_number(
    p_user_id           INT,
    p_phone_number      TEXT
) RETURNS TABLE (
    updated_phone_number  TEXT
) AS $$
DECLARE
    v_old_phone_number TEXT;
BEGIN
    SELECT phone_number INTO STRICT v_old_phone_number
    FROM user_contact_details
    WHERE id = p_user_id;

    INSERT INTO user_phone_history (user_id, xid, phone_number)
    SELECT  
        p_user_id, 
        COALESCE(MAX(xid), 0) + 1, 
        v_old_phone_number
    FROM user_phone_history
    WHERE user_id = p_user_id;

    UPDATE user_contact_details
    SET phone_number = p_phone_number
    WHERE id = p_user_id
    RETURNING phone_number INTO STRICT  updated_phone_number; 

    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION update_user_phone_number(INT, TEXT) TO app_user;
SELECT create_distributed_function(
  'update_user_phone_number(INT, TEXT)', 'p_user_id'
);