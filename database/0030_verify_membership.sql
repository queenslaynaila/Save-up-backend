CREATE OR REPLACE FUNCTION check_grp_membership(
    p_user_id INT,
    p_group_id INT
)
RETURNS VOID AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM group_members
        WHERE user_id = p_user_id
        AND group_id = p_group_id
        AND is_active = TRUE
    ) THEN
        RAISE EXCEPTION 'ERR_NOT_GROUP_MEMBER';
    END IF;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION check_grp_membership(INT, INT) TO app_user;
SELECT create_distributed_function(
  'check_grp_membership(INT, INT)', 'p_group_id'
);