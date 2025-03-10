CREATE OR REPLACE FUNCTION check_grp_membership(
    p_group_id              INT,
    p_user_id               INT,
    p_allow_admin_access    BOOLEAN DEFAULT FALSE
)
RETURNS VOID AS $$
DECLARE
    v_user_role TEXT;
BEGIN
    IF p_allow_admin_access THEN
        SELECT role INTO v_user_role
        FROM users
        WHERE id = p_user_id;

        IF v_user_role IN ('Admin', 'Moderator') THEN
            RETURN;
        END IF;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM group_members
        WHERE user_id = p_user_id
          AND group_id = p_group_id
          AND is_active = TRUE
    ) THEN
        RAISE EXCEPTION USING
            MESSAGE = 'ERR_NOT_GROUP_MEMBER',
            ERRCODE = 'P0001';
    END IF;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION check_grp_membership(INT, INT, BOOLEAN) TO saveup_www;
SELECT create_distributed_function(
    'check_grp_membership(INT, INT, BOOLEAN)', 
    'p_group_id'
);