-- Function to create a new group
CREATE OR REPLACE FUNCTION create_group(
  p_name        TEXT, 
  p_created_by  INT
)
RETURNS TABLE (
  group_id    INT,
  name        TEXT,
  full_name   TEXT,
  created_at  TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_entity_id   INT,
  v_group_id    INT,
  v_pocket_id   INT
BEGIN 
    INSERT INTO entities (entity_type)
    VALUES ('Group')
    RETURNING id INTO STRICT v_entity_id;

    INSERT INTO groups (name, created_by)
    VALUES (p_name, p_created_by)
    RETURNING id INTO STRICT v_group_id, created_by, name, created_at;

    INSERT INTO user_groups (user_id, group_id)
    VALUES (p_created_by, v_group_id);

    INSERT INTO group_administrators(user_id, group_id)
    VALUES (p_created_by, v_group_id);

    INSERT INTO pockets (
        entity_id, 
        xid,
        category_id, 
        name, 
        priority,
        pocket_type
    )
    SELECT
        v_entity_id,
        COALESCE(MAX(xid), 0) + 1,
        12, 
        'Group Wallet', 
        'Intermediate'::enum_priority,
        'Standard'::enum_pocket_type
    FROM pockets
    WHERE entity_id = v_entity_id
    GROUP BY entity_id;
    RETURNING id INTO STRICT v_pocket_id;

    INSERT INTO default_pockets (entity_id, pocket_id)
    VALUES(v_entity_id, v_pocket_id);

    -- Join groups and users to get full name of creator
    RETURN QUERY SELECT 
      g.id AS group_id ,
      g.name, 
      u.full_name, 
      g.created_at
      FROM groups g
      INNER JOIN users u ON g.created_by = u.id
      WHERE g.id = group_id;
EXCEPTION 
    WHEN OTHERS THEN
        RAISE EXCEPTION 'An error occurred while creating the group';
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION create_group(TEXT, INT) TO app_user;