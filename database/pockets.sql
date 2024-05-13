
CREATE TYPE enum_statuses AS ENUM ('In Progress', 'Completed');
CREATE TYPE enum_priorities AS ENUM ('High', 'Intermediate', 'Low');
CREATE TYPE enum_pocket_types AS ENUM ('Standard Pocket','Locked Pocket');

===============================================================================================

CREATE TABLE IF NOT EXISTS pockets ( 
  entity_id               INT NOT NULL, 
  id                      INT NOT NULL,
  category_id             INT NOT NULL,
  name                    TEXT NOT NULL,
  description             TEXT,
  target_amount           NUMERIC(30, 2) NOT NULL DEFAULT 0,
  saved_amount            NUMERIC(30, 2) NOT NULL DEFAULT 0 CHECK (saved_amount >= 0),
  priority                enum_priorities NOT NULL DEFAULT 'Intermediate',
  status                  enum_statuses NOT NULL DEFAULT 'In Progress',
  target_at               TIMESTAMP WITH TIME ZONE,
  is_default_pocket       BOOLEAN NOT NULL DEFAULT FALSE,
  pocket_type             enum_pocket_types NOT NULL DEFAULT 'Standard Pocket',
  reminder_count          INT NOT NULL DEFAULT 0,
  last_reminder_sent_at   TIMESTAMP WITH TIME ZONE,
  interest_earned         NUMERIC(30, 2) NOT NULL DEFAULT 0,
  created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at            TIMESTAMP WITH TIME ZONE, 
  deleted_at              TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY             (entity_id, id), 
  FOREIGN KEY             (entity_id) REFERENCES entities(id),
  FOREIGN KEY             (category_id) REFERENCES categories(id)
);

-- Index pockets for faster retrievals by ownership
Create INDEX idx_pockets_by_entity_id ON pockets(entity_id);
SELECT create_distributed_table('pockets', 'id');

===============================================================================================
-- Trigger: Update the status of a pocket to Complete when total savings exceeds target amount set.

CREATE OR REPLACE FUNCTION update_pockets_status()
RETURNS TRIGGER AS $$
DECLARE
    total_savings NUMERIC(30, 2);
BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO total_savings
    FROM savings
    WHERE user_id = NEW.user_id AND saving_id = NEW.saving_id;

    IF total_savings >= (SELECT target_amount FROM pockets WHERE user_id = NEW.user_id AND id = NEW.saving_id) THEN
        UPDATE pockets
        SET status = 'Completed',
            completed_date = NOW()
        WHERE id = NEW.saving_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_update_saving_status
AFTER INSERT ON savings
FOR EACH ROW
EXECUTE FUNCTION update_pockets_status();

===============================================================================================
--Trigger: Update interest rates

CREATE OR REPLACE FUNCTION compute_interest_earned
RETURNS TRIGGER AS $$
DECLARE
      total_savings NUMERIC(30, 2);
      pocket_rate   NUMERIC(3, 2);
      pocket_type   enum_pocket_types;
BEGIN
   --Pocket type for the given pokcet
    SELECT pocket_type INTO pocket_type
    FROM pockets
    WHERE id = NEW.pocket_id;

   --Fetch rate for the pocket type
    SELECT rate INTO pocket_rate
    FROM interest_rates
    WHERE pocket_type = pocket_type;
 
   --Compute total savings for the ggiven pocket
    SELECT COALESCE(SUM(amount), 0) INTO total_savings
    FROM savings
    WHERE user_id = NEW.user_id AND saving_id = NEW.saving_id;

    -- Fetch the timestamp of the last interest calculation
    SELECT MAX(created_at) INTO last_interest_calculation
    FROM transaction_logs
    WHERE user_id = NEW.user_id AND pocket_id = NEW.pocket_id AND transaction_type = SAVINGS;
    days_elapsed = DATE_PART('day', NOW() - last_interest_calculation);
 
    --Calculate interest earned aad update
     NEW.interest_earned = (total_savings * pocket_rate/100 * days_elapsed) / (* 365); 

    UPDATE pockets
    SET interest_earned = NEW.interest_earned
    WHERE id = NEW.pocket_id;

    RETURN NEW;
END
$$ LANGUAGE plgpgsql

CREATE TRIGGER enforce_compute_interest_earned
AFTER INSERT ON savings OR INSERT ON external_savings
FOR EACH ROW
EXECUTE FUNCTION compute_interest_earned();