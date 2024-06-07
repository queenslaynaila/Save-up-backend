CREATE OR REPLACE FUNCTION verify_update_security_answer(
  p_user_id            INT,  
  p_hashed_token       TEXT
)
RETURNS TABLE  (
    phone_number     TEXT
)
AS $$
DECLARE
    v_phone_number   TEXT;
BEGIN 
  INSERT INTO reset_tokens (user_id, xid, token)
  SELECT  p_user_id,
          COALESCE(MAX(xid), 0) + 1,
          p_hashed_token
  FROM reset_tokens
  WHERE user_id = p_user_id;

  SELECT phone_number INTO v_phone_number 
  FROM user_contact_details
  WHERE id = p_user_id;

  RETURN QUERY SELECT v_phone_number;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION update_security_answer(INT, TEXT) TO app_user;
SELECT create_distributed_function(
  'update_security_answer(INT, TEXT)'
);

UPDATE pockets
  SET answer = COALESCE(:answer, answer),
      question_id = COALESCE(:question_id, question_id),
  WHERE user_id = :user_id