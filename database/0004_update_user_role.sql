CREATE OR REPLACE FUNCTION update_user_role(
    p_user_id           INT,
    p_new_role          enum_user_role
) RETURNS TABLE (
    full_name     TEXT,
    new_role      enum_user_role
) AS $$
DECLARE
    v_old_role       enum_user_role;
BEGIN
    SELECT u.full_name, u.role INTO STRICT full_name, v_old_role
    FROM users u
    WHERE u.id = p_user_id;

    INSERT INTO user_role_history (user_id, xid, role)
    SELECT 
        p_user_id, 
        COALESCE(MAX(xid), 0) + 1, 
        v_old_role
    FROM user_role_history
    WHERE user_id = p_user_id;

    UPDATE users
    SET role = p_new_role
    WHERE id = p_user_id
    RETURNING role INTO STRICT new_role;
    
    RETURN QUERY SELECT u.full_name, new_role
    FROM users u
    WHERE u.id = p_user_id;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION update_user_role(
    INT, 
    enum_user_role
) TO app_user;
SELECT create_distributed_function(
  'update_user_role(INT, enum_user_role)', 'p_user_id'
);


