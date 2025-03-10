CREATE OR REPLACE FUNCTION update_id_number(
  p_user_id             INT,
  p_new_id_type         enum_id_type,
  p_new_id_number       TEXT
) 
RETURNS TABLE (
  id_number           TEXT
) AS $$
DECLARE
  v_old_id_type         enum_id_type;
  v_old_id_number       TEXT;
  v_new_id_number       TEXT;
BEGIN
  SELECT users.id_type, users.id_number
  INTO STRICT v_old_id_type, v_old_id_number
  FROM users
  WHERE users.id = p_user_id;

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
    id_type = p_new_id_type,
    id_number = p_new_id_number
  WHERE users.id = p_user_id
  RETURNING users.id_number INTO STRICT v_new_id_number;

  RETURN QUERY 
    SELECT v_new_id_number AS id_number;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION update_id_number(INT, enum_id_type, TEXT) TO saveup_www;
SELECT create_distributed_function(
  'update_id_number(INT, enum_id_type, TEXT)', 'p_user_id'
);