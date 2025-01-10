CREATE OR REPLACE FUNCTION create_user(
    p_id_type       enum_id_type,
    p_id_number     TEXT,
    p_phone_number  TEXT,
    p_full_name     TEXT,
    p_gender        enum_gender,
    p_pin           TEXT,
    p_role          enum_user_role DEFAULT 'Standard' 
)
RETURNS TABLE (
    id              INT,
    id_type         enum_id_type,
    id_number       TEXT,
    phone_number    TEXT,
    full_name       TEXT,
    role            enum_user_role,
    gender          enum_gender,
    pin             TEXT,
    created_at      TIMESTAMP WITH TIME ZONE 
) AS $$
DECLARE
    v_entity_id   INT;
    v_pocket_id   INT;
BEGIN
    INSERT INTO entities (entity_type)
    VALUES ('User')
    RETURNING entities.id INTO STRICT v_entity_id;

    INSERT INTO user_contact_details (id, full_name, phone_number)
    VALUES (v_entity_id, p_full_name, p_phone_number);

    INSERT INTO users (id, id_type, id_number, role, gender, pin, created_at)
    VALUES (v_entity_id, p_id_type, p_id_number, p_role::enum_user_role, p_gender, p_pin, NOW());

    INSERT INTO pockets (entity_id, xid, category_id, name, priority, pocket_type)
    VALUES (v_entity_id, 1, 12, 'Wallet', 'Intermediate'::enum_priority, 'Standard'::enum_pocket_type)
    RETURNING pockets.xid INTO STRICT v_pocket_id;

    INSERT INTO default_pockets (entity_id, pocket_id)
    VALUES (v_entity_id, v_pocket_id);

    RETURN QUERY
    SELECT 
        users.id, 
        users.id_type, 
        users.id_number,
        user_contact_details.phone_number, 
        user_contact_details.full_name, 
        users.role, 
        users.gender, 
        users.pin,
        users.created_at
    FROM 
        users
    LEFT JOIN 
        user_contact_details ON users.id = user_contact_details.id
    WHERE 
        users.id = v_entity_id;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION USING
            MESSAGE = 'ERR_PHONE_NO_EXISTS',
            ERRCODE = '23505';
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION create_user(
    enum_id_type, TEXT, TEXT, TEXT, enum_gender, TEXT, enum_user_role
) TO app_user;