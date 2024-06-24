CREATE OR REPLACE FUNCTION update_user_role(
    p_user_id           INT,
    p_initiator_id      INT,
    p_new_role          enum_user_role
) RETURNS TABLE (
    full_name     TEXT,
    role          enum_user_role
) AS $$
DECLARE
    v_old_role       enum_user_role;
BEGIN
    SELECT full_name, role INTO STRICT v_old_role
    FROM users
    WHERE id = p_user_id;

    INSERT INTO user_role_history (user_id, xid, initiator_id, role)
    SELECT 
        p_user_id, 
        COALESCE(MAX(xid), 0) + 1, 
        p_initiator_id,
        v_old_role
    FROM user_role_history
    WHERE user_id = p_user_id;

    UPDATE users
    SET role = p_new_role
    WHERE id = p_user_id
    RETURNING role INTO STRICT role;

    RETURN QUERY SELECT full_name, role;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION update_user_role(
    INT, 
    INT, 
    enum_user_role
) TO app_user;
SELECT create_distributed_function(
  'update_user_role(INT, INT, enum_user_role)', 'p_user_id'
);