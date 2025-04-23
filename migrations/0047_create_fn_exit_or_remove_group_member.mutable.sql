CREATE OR REPLACE FUNCTION exit_or_remove_group_member(
    p_group_id     INT,
    p_initiator_id INT,
    p_target_id    INT
) RETURNS VOID AS $$
DECLARE
    v_member_count INT;
    v_exit_reason  enum_exit_reason;
BEGIN
    IF p_target_id != p_initiator_id THEN
        IF EXISTS (
            SELECT 1
            FROM group_deposits
            WHERE group_id = p_group_id
              AND user_id = p_target_id
        ) THEN
            RAISE EXCEPTION USING
                MESSAGE = 'ERR_CANT_REMOVE_USER_WITH_DEPOSITS',
                ERRCODE = 'P0006';
        END IF;
    END IF;

    UPDATE group_members
    SET is_active = FALSE
    WHERE group_id = p_group_id
      AND user_id = p_target_id
      AND is_active = TRUE;

    v_exit_reason := CASE
        WHEN p_target_id != p_initiator_id
            THEN 'Admin removal'::enum_exit_reason
        ELSE 'Self removal'::enum_exit_reason
    END;

    INSERT INTO group_lefts (
        group_id,
        user_id,
        xid,
        admin_id,
        reason
    )
    SELECT
        p_group_id,
        p_target_id,
        COALESCE(MAX(xid), 0) + 1,
        NULLIF(p_initiator_id, p_target_id),
        v_exit_reason
    FROM group_lefts
    WHERE group_id = p_group_id;

    IF p_target_id = p_initiator_id THEN
        SELECT COUNT(*)
        INTO STRICT v_member_count
        FROM group_members
        WHERE group_id = p_group_id
          AND is_active = TRUE;

        IF v_member_count = 0 THEN
            UPDATE groups
            SET deleted_at = NOW()
            WHERE id = p_group_id
              AND deleted_at IS NULL;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION exit_or_remove_group_member(
    INT,
    INT,
    INT
) TO saveup_www;

SELECT create_distributed_function(
    'exit_or_remove_group_member(INT, INT, INT)',
    'p_group_id'
);