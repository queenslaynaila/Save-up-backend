-- Table: Savings
CREATE TABLE IF NOT EXISTS savings (
  id                    INT NOT NULL,
  entity_id             INT NOT NULL, -- Entity ID of the user or group owning the savings.
  pocket_id             INT NOT NULL,
  user_id               INT NOT NULL,  -- ID of the user making the saving. For personal pockets, it's the same as entity_id.
                                       -- For group pockets, it represents the group member saving the money thus diff from entity_id. 
  amount                NUMERIC(30, 2) NOT NULL,
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY           (pocket_id, id), 
  FOREIGN KEY           (entity_id, pocket_id) REFERENCES pockets (entity_id, id),
  FOREIGN KEY           (entity_id) REFERENCES entities(id),
  FOREIGN KEY           (user_id) REFERENCES users(id)
);

CREATE INDEX idx_savings_by_pocket_id ON savings(pocket_id);
SELECT create_distributed_table('savings', 'pocket_id');

-- Table: External Savings 
-- Stores contributions/ donations made by non members of the app towards an individual or group goal.
-- Once a non member makes a donations we create a donor account for him in donors table 
-- so in case they donate again he doesnt have to re enter their details
CREATE TABLE IF NOT EXISTS external_savings (
  id                    INT NOT NULL,
  pocket_id             INT NOT NULL,
  donor_id              INT NOT NULL,
  amount                NUMERIC(30, 2) NOT NULL,
  show_donor_details    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY           (pocket_id, id), 
  FOREIGN KEY           (donor_id) REFERENCES donors(donor_id)
);

CREATE INDEX idx_external_savings_by_pocket_id ON external_savings(pocket_id);
SELECT create_distributed_table('external_savings', 'pocket_id');

CREATE OR REPLACE FUNCTION create_donor_account()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the donor exists if not create a donor account for the donor
    IF NOT EXISTS (
        SELECT 1 FROM donors WHERE phone_number = NEW.phone_number
    ) THEN
        INSERT INTO donors (full_name, phone_number)
        VALUES (NEW.full_name, NEW.phone_number);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER capture_external_savings_trigger
AFTER INSERT ON external_savings
FOR EACH ROW
EXECUTE FUNCTION create_donor_account();
