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
  PRIMARY KEY           (pocket_id, id), 

);

GRANT INSERT, SELECT ON savings TO app_user;
CREATE INDEX idx_savings_by_pocket_id ON savings(pocket_id);
SELECT create_distributed_table('savings', 'pocket_id');

ALTER TABLE savings
ADD CONSTRAINT fk_pocket_id
FOREIGN KEY (entity_id, pocket_id) REFERENCES pockets (entity_id, id);

CREATE TABLE IF NOT EXISTS donors (
  entity_id            INT NOT NULL PRIMARY KEY,
  full_name            TEXT NOT NULL,
  phone_number         TEXT NOT NULL UNIQUE,
  created_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY          (entity_id) REFERENCES entities(id)
);

-- Stores contributions/ donations made by non members of the app towards an individual or group goal.
-- Once a non member makes a donations we create a donor account for him in donors table 
-- so in case they donate again he doesnt have to re enter their details
CREATE TABLE IF NOT EXISTS external_savings (
  id                    INT NOT NULL,
  entity_id             INT NOT NULL, -- Entity ID of the donor owning the savings.
  pocket_id             INT NOT NULL,
  amount                NUMERIC(30, 2) NOT NULL,
  show_donor_details    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY           (pocket_id, id), 
  FOREIGN KEY           (entity_id) REFERENCES entities(id)
);

CREATE INDEX idx_external_savings_by_pocket_id ON external_savings(pocket_id);
SELECT create_distributed_table('external_savings', 'pocket_id');

ALTER TABLE external_savings
ADD CONSTRAINT fk_exsavings_pocket_id
FOREIGN KEY (entity_id, pocket_id) REFERENCES pockets (entity_id, id);

CREATE OR REPLACE FUNCTION create_external_savings(pocket_id INT, amount NUMERIC(30, 2), show_donor_details BOOLEAN, full_name TEXT, phone_number TEXT)
RETURNS VOID AS $$
DECLARE
   entity_id INTEGER;
   donor_id INTEGER;
BEGIN
    SELECT d.donor_id INTO donor_id
    FROM donors d
    WHERE d.phone_number = new_phone_number;
    
    IF donor_id IS NULL THEN
        INSERT INTO entities (entity_type)
        VALUES ('Donor')
        RETURNING id INTO donor_id;

        INSERT INTO donors (donor_id, full_name, phone_number)
        VALUES (donor_id, full_name, phone_number);
    END IF;

    INSERT INTO external_savings (id, entity_id, pocket_id, amount, show_donor_details)
    VALUES (COALESCE((SELECT MAX(id) + 1 FROM external_savings WHERE pocket_id = pocket_id), 1),
            donor_id, 
            pocket_id, 
            amount, 
            show_donor_details
          );
END;
$$ LANGUAGE plpgsql;