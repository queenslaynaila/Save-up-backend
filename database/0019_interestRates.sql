CREATE TABLE IF NOT EXISTS interest_rates (
  id                  SERIAL PRIMARY KEY,
  pocket_type         enum_pocket_types NOT NULL,
  name                TEXT NOT NULL,
  rate                NUMERIC NOT NULL CHECK (rate > 0),
  is_default_rate     BOOLEAN NOT NULL,
  start_date          TIMESTAMP WITH TIME ZONE NOT NULL, -- Start date of the interest rate validity if its an offer
  end_date            TIMESTAMP WITH TIME ZONE NOT NULL, -- End date of the interest rate validity if its an offer
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(), 
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE SEQUENCE interest_transaction_seq START 1

CREATE OR REPLACE PROCEDURE calculate_interest()
LANGUAGE plpgsql
AS $$
DECLARE
    pocket RECORD;
    current_balance NUMERIC(30, 2);
    interest_earned NUMERIC(30, 2);
    interest_rate NUMERIC(3, 2);
    interest_rate_standard NUMERIC(3, 2);
    interest_rate_locked NUMERIC(3, 2);
    last_interest_calculation TIMESTAMP;
    days_elapsed NUMERIC;
    new_cumulative NUMERIC;
    new_reference_no TEXT;
BEGIN
    -- Fetch interest rates for each pocket type once
    SELECT rate INTO interest_rate_standard FROM interest_rates WHERE pocket_type = 'Standard Pocket';
    SELECT rate INTO interest_rate_locked FROM interest_rates WHERE pocket_type = 'Locked Pocket';

    FOR pocket IN
        SELECT p.id AS pocket_id, p.pocket_type, p.entity_id
        FROM pockets p
        LEFT JOIN transaction_logs tl ON p.id = tl.pocket_id
        GROUP BY p.id, p.pocket_type, p.entity_id
        HAVING COUNT(tl.pocket_id) > 0  -- Exclude pockets with no financial transaction at all in the app
    LOOP
        -- Determine the interest rate based on the pocket type
        IF pocket.pocket_type = 'Standard Pocket' THEN
            interest_rate = interest_rate_standard;
        ELSIF pocket.pocket_type = 'Locked Pocket' THEN
            interest_rate = interest_rate_locked;
        END IF;

        -- Compute balance for the given pocket
        SELECT COALESCE(cumulative_amount, 0) INTO current_balance
        FROM transaction_logs
        WHERE pocket_id = pocket.pocket_id
        ORDER BY transaction_id DESC
        LIMIT 1;

        -- Fetch the timestamp of the last interest calculation
        SELECT MAX(created_at) INTO last_interest_calculation
        FROM transaction_logs
        WHERE pocket_id = pocket.pocket_id AND transaction_type = 'Interest Earned';

        IF last_interest_calculation IS NOT NULL THEN
            days_elapsed = DATE_PART('day', NOW() - last_interest_calculation);
        ELSE
            days_elapsed = 1;
        END IF;

        -- Calculate interest earned and update into logs
        interest_earned = (current_balance * interest_rate / 100 * days_elapsed) / 365;

        IF interest_earned > 0 THEN
            new_cumulative = current_balance + interest_earned;
            new_reference_no = 'INT' || nextval('interest_transaction_seq');
            INSERT INTO transaction_logs (
                transaction_id, pocket_id, entity_id, transaction_type, amount, cumulative_amount, reference_no, created_at
            ) VALUES (
                COALESCE((SELECT MAX(transaction_id) + 1 FROM transaction_logs WHERE pocket_id = pocket.pocket_id), 1),
                pocket.pocket_id,
                pocket.entity_id,
                'Interest Earned',
                interest_earned,
                new_cumulative,
                new_reference_no,
                NOW()
            );
        END IF;
    END LOOP;
END;
$$;


