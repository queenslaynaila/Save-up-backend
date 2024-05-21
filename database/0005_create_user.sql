-- Function to create a new user 
CREATE OR REPLACE FUNCTION create_user(
  p_full_name     TEXT, 
  p_gender        enum_gender,
  p_id_type       enum_id_type,
  p_id_number     INT, 
  p_phone_number  TEXT, 
  p_pin           TEXT
)
RETURNS VOID AS $$
DECLARE
  v_entity_id   INT;
  v_contact_id  INT;
  v_pocket_id   INT;
BEGIN 
  INSERT INTO entities (entity_type)
  VALUES ('User')
  RETURNING entities.id INTO STRICT v_entity_id;

  INSERT INTO user_contact_details (id, id_type, id_number, phone_number)
  VALUES (v_entity_id, p_id_type, p_id_number, p_phone_number)
  RETURNING user_contact_details.id INTO STRICT v_contact_id;

  INSERT INTO users (id, full_name, gender, pin)
  VALUES (v_contact_id, p_full_name, p_gender, p_pin);
  
  INSERT INTO pockets (entity_id, xid, category_id, name, priority, pocket_type)
  VALUES (v_entity_id, 1, 12, 'Wallet',  'Intermediate'::enum_priority, 'Standard'::enum_pocket_type)
  RETURNING  pockets.xid INTO STRICT v_pocket_id;

  INSERT INTO default_pockets (entity_id, pocket_id)
  VALUES (v_entity_id, v_pocket_id);
EXCEPTION 
  WHEN unique_violation THEN
    RAISE EXCEPTION 'User with that national ID or phone number already exists.';
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION create_user(TEXT, enum_gender, enum_id_type, INT, TEXT, TEXT) TO app_user;