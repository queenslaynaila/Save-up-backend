CREATE OR REPLACE FUNCTION update_user_details(
    p_user_id               INT,
    p_new_phone_number      TEXT DEFAULT NULL,
    p_new_id_type           enum_id_type DEFAULT NULL,
    p_new_id_number         TEXT DEFAULT NULL,
    p_new_role              enum_user_role DEFAULT NULL,
    p_admin_id              INT DEFAULT NULL
) 
RETURNS TABLE (
    field_updated   TEXT,
    old_value      TEXT,
    new_value      TEXT
) AS $$
DECLARE
    v_old_phone      TEXT;
    v_old_id_type    enum_id_type;
    v_old_id_number  TEXT;
    v_old_role       enum_user_role;
    v_full_name      TEXT;
BEGIN
    SELECT 
        user_contact_details.full_name, 
        user_contact_details.phone_number, 
        users.id_type, 
        users.id_number, 
        users.role
    INTO STRICT 
        v_full_name, 
        v_old_phone, 
        v_old_id_type, 
        v_old_id_number, 
        v_old_role
    FROM users
    LEFT JOIN user_contact_details ON users.id = user_contact_details.id
    WHERE users.id = p_user_id;

    IF p_new_phone_number IS NOT NULL THEN
        INSERT INTO user_phone_history (
            user_id, 
            xid, 
            phone_number
        )
        SELECT 
            p_user_id, 
            COALESCE(MAX(xid), 0) + 1, 
            v_old_phone
        FROM user_phone_history
        WHERE user_id = p_user_id;

        UPDATE user_contact_details
        SET phone_number = p_new_phone_number
        WHERE id = p_user_id;

        RETURN QUERY 
        SELECT 
            'phone_number'::TEXT,
            v_old_phone,
            p_new_phone_number;
    END IF;

    IF p_new_id_number IS NOT NULL THEN
        IF p_new_id_type  IS NULL THEN
            RAISE EXCEPTION USING
                MESSAGE = 'ERR_ID_TYPE REQUIRED',
                ERRCODE = 'P0001';
        END IF;
        INSERT INTO user_id_history (
            user_id, 
            xid, 
            id_type, 
            id_number
        )
        SELECT 
            p_user_id, 
            COALESCE(MAX(xid), 0) + 1, 
            v_old_id_type, 
            v_old_id_number
        FROM user_id_history
        WHERE user_id = p_user_id;

        UPDATE users
        SET 
            id_type = COALESCE(p_new_id_type, v_old_id_type),
            id_number = p_new_id_number
        WHERE id = p_user_id;

        RETURN QUERY 
        SELECT 
            'id_number'::TEXT,
            v_old_id_number,
            p_new_id_number;
    END IF;

    IF p_new_role IS NOT NULL THEN
        IF p_admin_id IS NULL THEN
            RAISE EXCEPTION USING
                MESSAGE = 'ERR_ADMIN_ID_REQUIRED',
                ERRCODE = 'P0001';
        END IF;
        
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

        INSERT INTO user_role_history (
            user_id, 
            xid, 
            admin_id, 
            role
        )
        SELECT 
            p_user_id, 
            COALESCE(MAX(xid), 0) + 1, 
            p_admin_id, 
            v_old_role
        FROM user_role_history
        WHERE user_id = p_user_id;

        UPDATE users
        SET role = p_new_role
        WHERE id = p_user_id;

        RETURN QUERY 
        SELECT 
            'role'::TEXT,
            v_old_role::TEXT,
            p_new_role::TEXT;
    END IF;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION update_user_details(INT, TEXT, enum_id_type, TEXT, enum_user_role, INT) TO saveup_www;

SELECT create_distributed_function(
  'update_user_details(INT, TEXT, enum_id_type, TEXT, enum_user_role, INT)', 'p_user_id'
);