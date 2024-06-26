CREATE OR REPLACE FUNCTION increment_attempts(
    p_user_id INT
)
RETURNS INT AS $$
DECLARE 
  v_failed_attempts INT;
  v_attempts_left INT;
BEGIN
    UPDATE users
    SET failed_attempts = failed_attempts + 1
    WHERE id = p_user_id
    RETURNING failed_attempts INTO v_failed_attempts;

    IF v_failed_attempts >= 3 THEN
      UPDATE users
      SET is_locked = TRUE
      WHERE id = p_user_id;
    END IF;
    
    v_attempts_left = 3 - v_failed_attempts;

    RETURN v_attempts_left;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION increment_attempts(INT) TO app_user;
SELECT create_distributed_function('increment_attempts(INT)', 'p_user_id');