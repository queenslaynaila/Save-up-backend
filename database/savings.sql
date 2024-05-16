-- Create the 'savings' table without the distributed 
-- pockets foreign key constraint as citus 
-- doesnt allow a normal psql table to ref a distributed table
-- Distribute table by user id
-- Use alter command to add the fk constaint thereby bypasing citus

CREATE TABLE IF NOT EXISTS savings (
  id                    INT NOT NULL,
  entity_id             INT NOT NULL, -- Entity ID of the user or group owning the savings.
  pocket_id             INT NOT NULL,
  user_id               INT NOT NULL,  -- ID of the user making the saving. For personal pockets, it's the same as entity_id.
                                       -- For group pockets, it represents the group member saving the money thus diff from entity_id. 
  amount                NUMERIC(30, 2) NOT NULL,
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY           (pocket_id, id)
);

GRANT INSERT, SELECT ON savings TO app_user;
CREATE INDEX idx_savings_by_pocket_id ON savings(pocket_id);
SELECT create_distributed_table('savings', 'pocket_id');

ALTER TABLE savings
ADD CONSTRAINT fk_pocket_id
FOREIGN KEY (entity_id, pocket_id) REFERENCES pockets (entity_id, id);

CREATE OR REPLACE FUNCTION create_saving(user_id_arg INT, pocket_id_arg INT, saving_amount_arg NUMERIC, entity_id_arg INT)
RETURNS TABLE (pocket_name TEXT) AS $$
DECLARE
    total_savings NUMERIC;
BEGIN 
    INSERT INTO savings (id, pocket_id, user_id, entity_id, amount)
    SELECT COALESCE(MAX(id), 0) + 1, pocket_id_arg, user_id_arg, entity_id_arg, saving_amount_arg
    FROM savings 
    WHERE pocket_id = pocket_id_arg; 
    
    SELECT COALESCE(cumulative_amount, 0) INTO total_savings
    FROM transaction_logs
    WHERE pocket_id = pocket_id_arg
    ORDER BY transaction_id DESC
    LIMIT 1;
	
    IF total_savings >= (SELECT target_amount FROM pockets WHERE entity_id = entity_id_arg AND id = pocket_id_arg) THEN
        UPDATE pockets
        SET status = 'Completed',
            completed_date = NOW()
        WHERE id = pocket_id_arg;
    END IF;

    RETURN QUERY SELECT name FROM pockets WHERE id = pocket_id_arg;
END;
$$ LANGUAGE plpgsql;
