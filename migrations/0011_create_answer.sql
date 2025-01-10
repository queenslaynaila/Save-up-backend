CREATE OR REPLACE FUNCTION create_answers(
  p_user_id INT,
  p_answers JSONB
)
RETURNS VOID AS $$
DECLARE
  v_answer_count INT;
  v_new_count INT;
BEGIN
  SELECT COUNT(*) INTO STRICT v_answer_count 
  FROM security_answers 
  WHERE security_answers.user_id = p_user_id;

  SELECT jsonb_array_length(p_answers) INTO v_new_count;
  IF v_answer_count + v_new_count > 3 THEN
    RAISE EXCEPTION USING 
        MESSAGE = 'ERR_MAX_ANSWERS_EXCEEDED',
        ERRCODE = 'P0003';
  END IF;

  INSERT INTO security_answers (user_id, question_id, answer)
  SELECT p_user_id, 
         (entry->>'question_id')::INT, 
         entry->>'answer'
  FROM jsonb_array_elements(p_answers) AS entry;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION create_answers(INT, JSONB) TO app_user;

SELECT create_distributed_function(
  'create_answers(INT, JSONB)', 'p_user_id'
);
