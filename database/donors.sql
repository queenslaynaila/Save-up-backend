---Donors
CREATE TABLE IF NOT EXISTS donors (
  donor_id             SERIAL PRIMARY KEY,
  full_name            TEXT NOT NULL,
  phone_number         TEXT NOT NULL UNIQUE,
  created_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

--Create a donor account for every donor on donatiom

CREATE OR REPLACE FUNCTION capture_and_save_external_savings()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM donors WHERE phone_number = NEW.phone_number
    ) THEN
        INSERT INTO donors (full_name, phone_number)
        VALUES (NEW.full_name, NEW.phone_number);
    END IF;

    INSERT INTO external_savings (pocket_id, donor_id, amount, show_donor_details)
    SELECT NEW.pocket_id, d.id, NEW.amount, NEW.show_donor_details
    FROM donors d
    WHERE d.phone_number = NEW.phone_number;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER capture_external_savings_trigger
AFTER INSERT ON external_savings
FOR EACH ROW
EXECUTE FUNCTION capture_and_save_external_savings();