-- Function to create a new user 
CREATE OR REPLACE FUNCTION create_user(
  p_full_name     TEXT, 
  p_gender        enum_genders,
  p_id_number     INT, 
  p_phone_number  TEXT, 
  p_pin           TEXT
  )
RETURNS VOID AS $$
DECLARE
  v_user_id   INTEGER,
  v_pocket_id INTEGER
BEGIN 
      INSERT INTO entities (entity_type)
      VALUES ('User')
      RETURNING id INTO STRICT v_user_id;

      INSERT INTO user_contact_details (id, phone_number, national_id)
      VALUES (v_user_id, p_phone_number, p_id_number);

      INSERT INTO users (id, full_name, gender, pin)
      VALUES (v_user_id, p_full_name, p_gender, p_pin);
      
      INSERT INTO pockets ( 
       entity_id, 
       ex_id, 
       category_id, 
       name, 
       priority,
       pocket_type
      )
      VALUES(v_user_id, 1, 12, 'Wallet',  'Intermediate'::enum_priorities, 'Locked'::enum_pocket_types);
      RETURNING id INTO STRICT v_pocket_id;

      INSERT INTO default_pockets (entity_id, pocket_id)
      VALUES(v_user_id, v_pocket_id);
EXCEPTION 
    WHEN unique_violation THEN
      RAISE EXCEPTION 'User with that national ID or phone number already exists.';
END;
$$ LANGUAGE plpgsql;