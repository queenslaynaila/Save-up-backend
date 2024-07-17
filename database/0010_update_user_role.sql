CREATE OR REPLACE FUNCTION update_user_role(
    p_target_user_id    INT,
    p_new_role          enum_user_role,
    p_admin_id          INT 
) 
RETURNS TABLE (
    full_name     TEXT,
    new_role      enum_user_role
) AS $$
DECLARE
    v_full_name      TEXT;
    v_old_role       enum_user_role;
    v_new_role       enum_user_role;
BEGIN
    IF NOT EXISTS (
       SELECT 1
       FROM users
       WHERE id = p_admin_id 
       AND role = 'Admin'
    ) THEN
        RAISE EXCEPTION USING 
            MESSAGE = 'ERR_NOT_ADMIN',
            ERRCODE = 'P0002';
    END IF;

    SELECT user_contact_details.full_name, users.role 
    INTO STRICT v_full_name, v_old_role
    FROM users 
    INNER JOIN user_contact_details
    ON users.id = user_contact_details.id
    WHERE users.id = p_target_user_id;

    INSERT INTO user_role_history(user_id, xid, role)
    SELECT 
        p_target_user_id , 
        COALESCE(MAX(xid), 0) + 1, 
        v_old_role
    FROM user_role_history
    WHERE user_id = p_target_user_id ;

    UPDATE users
    SET role = p_new_role
    WHERE id = p_target_user_id 
    RETURNING role INTO STRICT v_new_role;
    
    RETURN QUERY SELECT v_full_name, v_new_role;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION update_user_role(
    INT, 
    enum_user_role
) TO app_user;
SELECT create_distributed_function(
  'update_user_role(INT, enum_user_role)', 'p_target_user_id'
);


