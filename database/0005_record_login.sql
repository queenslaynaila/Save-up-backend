CREATE OR REPLACE FUNCTION record_login_attempt(
    p_user_id          INT,
    p_ip_address       TEXT,
    p_browser_info     TEXT,
    p_location         TEXT,
    p_success          BOOLEAN,
    p_reason           TEXT
)
RETURNS VOID AS
$$
BEGIN
    INSERT INTO login_attempts (user_id, xid, ip_address, browser_info, location, success, reason)
    SELECT 
        p_user_id, 
        COALESCE(MAX(xid), 0) + 1, 
        p_ip_address, 
        p_browser_info, 
        p_location, 
        p_success, 
        p_reason
    FROM login_attempts
    WHERE user_id = p_user_id
END;
$$ LANGUAGE plpgsql;

GRANT INSERT, SELECT ON login_attempts TO app_user;
SELECT create_distributed_function('record_login_attempt(TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT)', 'p_user_id');