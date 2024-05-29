CREATE OR REPLACE FUNCTION create_answer(
  p_user_id       INT, 
  p_question_id   INT,
  p_answer        TEXT
)
RETURNS VOID AS $$
DECLARE
  v_answer_count   INT;
BEGIN 
  SELECT COUNT(*) INTO STRICT v_answer_count 
  FROM security_answers 
  WHERE security_answers.user_id = p_user_id;
  
  IF v_answer_count = 3 THEN
     RAISE EXCEPTION 'User cannot have more than 3 security answers.';
  ELSE
    INSERT INTO security_answers (user_id, question_id, answer) 
    VALUES (p_user_id, p_question_id, p_answer);
  END IF;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION create_answer(INT, INT, TEXT) TO app_user;
SELECT create_distributed_function(
  'create_answer(INT, INT, TEXT)', 'p_user_id'
);