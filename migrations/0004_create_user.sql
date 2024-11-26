CREATE OR REPLACE FUNCTION create_user(
    p_id_type       enum_id_type,
    p_id_number     TEXT,
    p_phone_number  TEXT,
    p_full_name     TEXT,
    p_gender        enum_gender,
    p_pin           TEXT,
    p_role          enum_user_role DEFAULT 'Standard' 
)
RETURNS VOID AS $$
DECLARE
    v_entity_id   INT;
    v_pocket_id   INT;
BEGIN
    INSERT INTO entities (entity_type)
    VALUES ('User')
    RETURNING id INTO STRICT v_entity_id;

    INSERT INTO user_contact_details (id, full_name, phone_number)
    VALUES (v_entity_id, p_full_name, p_phone_number);

    INSERT INTO users (id, id_type, id_number, role, gender, pin)
    VALUES (v_entity_id, p_id_type, p_id_number, p_role::enum_user_role, p_gender, p_pin);

    INSERT INTO pockets (entity_id, xid, category_id, name, priority, pocket_type)
    VALUES (v_entity_id, 1, 12, 'Wallet', 'Intermediate'::enum_priority, 'Standard'::enum_pocket_type)
    RETURNING xid INTO STRICT v_pocket_id;

    INSERT INTO default_pockets (entity_id, pocket_id)
    VALUES (v_entity_id, v_pocket_id);
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

SELECT create_distributed_function(
    'create_user(enum_id_type, TEXT, TEXT, TEXT, enum_gender, TEXT, enum_user_role)'
);