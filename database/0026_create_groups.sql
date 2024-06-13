CREATE OR REPLACE FUNCTION create_group(
  p_name         TEXT, 
  p_creator_id   INT
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

    INSERT INTO groups (id, name, creator_id)
    VALUES (v_entity_id, p_name, p_creator_id);

    INSERT INTO group_users (group_id, user_id)
    VALUES (v_entity_id, p_creator_id);

    INSERT INTO group_administrators(group_id, user_id)
    VALUES (v_entity_id, p_creator_id);

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
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION create_group(TEXT, INT) TO app_user;
SELECT create_distributed_function('create_group(TEXT, INT)');