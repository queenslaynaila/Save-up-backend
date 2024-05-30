CREATE OR REPLACE FUNCTION create_group(
  p_name        TEXT, 
  p_created_by  INT
)
RETURNS TABLE (
  id            INT,
  name          TEXT,
  created_at    TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_entity_id   INT;
  v_pocket_id   INT;
BEGIN 
    INSERT INTO entities (entity_type)
    VALUES ('Group')
    RETURNING entities.id INTO STRICT v_entity_id;

    INSERT INTO groups (id, name, created_by)
    VALUES (v_entity_id, p_name, p_created_by);

    INSERT INTO user_groups (user_id, group_id)
    VALUES (p_created_by, v_entity_id);

    INSERT INTO group_administrators(user_id, group_id)
    VALUES (p_created_by, v_entity_id);

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
    RETURNING xid INTO STRICT v_pocket_id;

    INSERT INTO default_pockets (entity_id, pocket_id)
    VALUES(v_entity_id, v_pocket_id);

    RETURN QUERY SELECT 
      groups.id,
      groups.name, 
      groups.created_at 
      FROM groups 
      WHERE groups.id = v_entity_id;
EXCEPTION 
    WHEN OTHERS THEN
        RAISE EXCEPTION 'An error occurred while creating the group';
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION create_group(TEXT, INT) TO app_user;
SELECT create_distributed_function('create_group(TEXT, INT)');