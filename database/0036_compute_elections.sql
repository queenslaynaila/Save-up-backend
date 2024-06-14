CREATE OR REPLACE FUNCTION compute_election_results(
    p_group_id          INT, 
    p_election_id       INT
)
RETURNS VOID AS $$
DECLARE
    top_nominee RECORD;
BEGIN
    UPDATE group_administrators 
    SET revoked_at = NOW() 
    WHERE group_id = p_group_id 
    AND revoked_at IS NULL;

    FOR top_nominee IN
        SELECT nominee_id
        FROM (
            SELECT nominee_id, COUNT(*) AS nominations_count
            FROM nominations
            WHERE group_id = p_group_id
            AND election_id = p_election_id
            AND revoked_at IS NULL
            GROUP BY nominee_id
            ORDER BY nominations_count DESC
            LIMIT 3
        ) AS top_nominees
    LOOP
        INSERT INTO group_administrators (group_id, xid, user_id, created_at)
        SELECT
            p_group_id,
            COALESCE(MAX(xid), 0) + 1,
            top_nominee.nominee_id,
            NOW()
        FROM group_administrators 
        WHERE group_id = p_group_id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

SELECT create_distributed_function(
  'compute_election_results(INT, INT)' , 'p_group_id'
);

GRANT EXECUTE ON FUNCTION compute_election_results(INT, INT) TO app_user;