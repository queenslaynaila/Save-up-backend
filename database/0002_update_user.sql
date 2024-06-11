CREATE OR REPLACE FUNCTION update_user_role(
  p_id             INT,
  p_role           TEXT
)
RETURNS VOID AS $$
BEGIN 
  UPDATE entities
  SET entity_type = p_role 
  WHERE id = p_id; 

  UPDATE users 
  SET role = p_role 
  WHERE id = p_id; 
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION update_user_role(INT, TEXT) TO app_user;
SELECT create_distributed_function(
  'update_user_role(INT,  TEXT)', 'p_id'
);