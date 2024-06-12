CREATE OR REPLACE FUNCTION nominate_admin(
  p_group_id       INT,
  p_user_id        INT
)
RETURNS VOID AS $$
BEGIN 
  UPDATE group_administrators
  SET revoked_at = NOW()
  WHERE group_id = p_group_id
  AND revoked_at IS NULL;

  UPDATE nominated_administrators
  SET revoked_at = NOW()
  WHERE group_id = p_group_id
  AND revoked_at IS NULL;

  INSERT INTO nominated_administrators (group_id, user_id)
  VALUES (p_group_id, p_user_id);
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION nominate_admin(INT, INT) TO app_user;
SELECT nominate_admin(
  'nominate_admin(INT, INT)', 'group_id'
);