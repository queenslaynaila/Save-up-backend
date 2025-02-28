CREATE OR REPLACE FUNCTION create_donor(
  p_full_name     TEXT, 
  p_phone_number  TEXT
)
RETURNS TABLE (
  donor_id       INT
) AS $$
DECLARE
  v_entity_id   INT;
BEGIN 
  INSERT INTO entities (entity_type)
  VALUES ('Donor'::enum_entity_type)
  RETURNING id INTO STRICT v_entity_id;

  INSERT INTO donors (id, full_name, phone_number)
  VALUES (v_entity_id, p_full_name, p_phone_number);

  RETURN QUERY SELECT v_entity_id AS donor_id;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION create_donor(TEXT, TEXT) TO saveup_www;
SELECT create_distributed_function(
  'create_donor(TEXT, TEXT)'
);