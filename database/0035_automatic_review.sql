CREATE TABLE IF NOT EXISTS admin_feedback (
  group_id            INT NOT NULL,
  xid                 INT NOT NULL,
  administrator_id    INT NOT NULL,
  reviewer_id         INT NOT NULL,
  is_satisfied        BOOLEAN NOT NULL,
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY         (group_id, xid),
  FOREIGN KEY         (group_id) REFERENCES groups(id)
);



CREATE OR REPLACE FUNCTION automatic_review_process()
RETURNS VOID AS $$
DECLARE
    v_administrator_record   RECORD;
    v_total_members          INT;
    v_unsatisfied_count      INT;
    v_satisfied_threshold    NUMERIC; 
BEGIN
    FOR v_administrator_record IN
        SELECT *
        FROM group_administrators
        WHERE next_review <= NOW()
    LOOP
        SELECT COUNT(*)
        INTO STRICT v_total_members
        FROM group_users
        WHERE group_id = v_administrator_record.group_id;

        v_satisfied_threshold := CEIL(v_total_members * 0.5)

        SELECT COUNT(*)
        INTO v_unsatisfied_count
        FROM administrator_feedback
        WHERE administrator_id = v_administrator_record.user_id
        AND satisfied = FALSE;

        UPDATE group_administrators
        SET next_review = NOW() + INTERVAL '90 days'
        WHERE group_id = v_administrator_record.group_id
        AND user_id = v_administrator_record.user_id;

        IF v_unsatisfied_count > v_satisfied_threshold THEN
            UPDATE group_administrators
            SET term_ends = NOW()
            WHERE group_id = v_administrator_record.group_id
            AND user_id = v_administrator_record.user_id
            AND term_ends IS NULL;

            INSERT INTO elections (group_id, xid, initiator_id )
            SELECT 
                 v_administrator_record.group_id,
                 COALESCE(MAX(xid), 0) + 1,
                 1
            FROM elections
            WHERE group_id =  v_administrator_record.group_id;

            PERFORM initiate_election(v_administrator_record.group_id);
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

