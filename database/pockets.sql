
CREATE TYPE enum_statuses AS ENUM ('In Progress', 'Completed');
CREATE TYPE enum_priorities AS ENUM ('High', 'Intermediate', 'Low');
CREATE TYPE enum_pocket_types AS ENUM ('Standard Pocket','Locked Pocket');

CREATE TABLE IF NOT EXISTS pockets ( 
  entity_id               INT NOT NULL, 
  id                      INT NOT NULL,
  category_id             INT NOT NULL,
  name                    TEXT NOT NULL,
  description             TEXT,
  target_amount           NUMERIC(30, 2) NOT NULL DEFAULT 0,
  priority                enum_priorities NOT NULL DEFAULT 'Intermediate',
  status                  enum_statuses NOT NULL DEFAULT 'In Progress',
  target_at               TIMESTAMP WITH TIME ZONE,
  is_default_pocket       BOOLEAN NOT NULL DEFAULT FALSE,
  pocket_type             enum_pocket_types NOT NULL DEFAULT 'Standard Pocket',
  reminder_count          INT NOT NULL DEFAULT 0,
  last_reminder_sent_at   TIMESTAMP WITH TIME ZONE,
  created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at            TIMESTAMP WITH TIME ZONE, 
  deleted_at              TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY             (entity_id, id), 
  FOREIGN KEY             (entity_id) REFERENCES entities(id),
  FOREIGN KEY             (category_id) REFERENCES categories(id)
);

Create INDEX idx_pockets_by_entity_id ON pockets(entity_id);
SELECT create_distributed_table('pockets', 'id');

--Trigger: Update pocket status to Completed when target amount is reached

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

