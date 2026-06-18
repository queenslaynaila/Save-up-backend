CREATE OR REPLACE FUNCTION update_user_role(
    p_target_user_id INT,
    p_new_role enum_user_role,
    p_admin_id INT
)
RETURNS VOID AS $$
DECLARE
    v_old_role       enum_user_role;
BEGIN
    SELECT users.role 
    INTO STRICT v_old_role
    FROM users
    WHERE users.id = p_target_user_id;

    INSERT INTO user_role_history (user_id, xid, admin_id, role)
    SELECT 
        p_target_user_id, 
        COALESCE(MAX(xid), 0) + 1,
        p_admin_id, 
        v_old_role
    FROM user_role_history
    WHERE user_id = p_target_user_id;

    UPDATE users
    SET role = p_new_role
    WHERE users.id = p_target_user_id;

END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION update_user_role(
    INT, enum_user_role, INT
) TO saveup_www;
SELECT create_distributed_function(
    'update_user_role(INT, enum_user_role, INT)',
    'p_target_user_id'
);
