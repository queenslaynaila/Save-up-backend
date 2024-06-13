CREATE OR REPLACE FUNCTION compute_election_results(
    p_group_id INT,
    p_election_id INT
) RETURNS VOID AS $$
DECLARE
    v_winner_id INT;
    v_winner_vote_count INT;
BEGIN
    SELECT nominee_id, COUNT(*) INTO v_winner_id, v_winner_vote_count
    FROM nomination_approvals
    WHERE group_id = p_group_id 
    AND election_id = p_election_id
    AND vote = true
    GROUP BY nominee_id
    ORDER BY COUNT(*) DESC
    LIMIT 1;
    
    UPDATE nominated_administrators
    SET revoked_at = NOW()
    WHERE group_id = p_group_id;

    UPDATE nomination_approvals
    SET revoked_at = NOW()
    WHERE group_id = p_group_id 
    AND election_id = p_election_id;

    INSERT INTO group_administrators (group_id, user_id, created_at)
    VALUES (p_group_id, v_winner_id, NOW());
END;
$$ LANGUAGE plpgsql;
