CREATE OR REPLACE FUNCTION update_id_number(
    p_user_id           INT,
    p_new_id_type       enum_id_type,
    p_new_id_number     TEXT
)
RETURNS TABLE (
    new_id_number  TEXT
) AS $$
DECLARE
    v_old_id_type       enum_id_type;
    v_old_id_number     TEXT;
BEGIN
    SELECT id_type, id_number
    INTO STRICT v_old_id_type, v_old_id_number
    FROM users
    WHERE id = p_user_id;

    INSERT INTO user_id_history (user_id, xid, id_type, id_number)
    SELECT
        p_user_id,
        COALESCE(MAX(xid), 0) + 1,
        v_old_id_type,
        v_old_id_number
    FROM user_id_history
    WHERE user_id = p_user_id;

    UPDATE users
    SET id_type = p_new_id_type,
        id_number = p_new_id_number
    WHERE id = p_user_id
    RETURNING id_number INTO STRICT new_id_number;

    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION update_id_number(
    INT, enum_id_type, TEXT
) TO app_user;
SELECT create_distributed_function(
  'update_id_number(INT, enum_id_type, TEXT)', 'p_user_id'
);