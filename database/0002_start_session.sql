CREATE OR REPLACE FUNCTION start_session(
    p_user_id INT
)
RETURNS VOID AS $$
BEGIN
    UPDATE users
    SET failed_attempts = 0
    WHERE id = p_user_id;

    INSERT INTO sessions (user_id, xid)
    SELECT
        p_user_id,
        COALESCE(MAX(xid), 0) + 1
    FROM sessions
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION start_session(INT) TO app_user;
SELECT create_distributed_function('start_session(INT)', 'p_user_id');