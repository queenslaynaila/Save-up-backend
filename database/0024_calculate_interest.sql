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
    SELECT rate INTO STRICT interest_rate_standard FROM interest_rates WHERE pocket_type = 'Standard Pocket';
    SELECT rate INTO STRICT interest_rate_locked FROM interest_rates WHERE pocket_type = 'Locked Pocket';

    FOR pocket IN
        SELECT p.id AS pocket_id, p.pocket_type, p.entity_id
        FROM pockets p
        LEFT JOIN transactions tl ON p.id = tl.pocket_id
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
        SELECT COALESCE(cumulative_amount, 0) INTO STRICT current_balance
        FROM transactions
        WHERE pocket_id = pocket.pocket_id
        ORDER BY transaction_id DESC
        LIMIT 1;

        -- Fetch the timestamp of the last interest calculation
        SELECT MAX(created_at) INTO STRICT last_interest_calculation
        FROM transactions
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
            new_reference_no =  substr(md5(random()::text), 1, 5);
            INSERT INTO transactions (
                xid, pocket_id, entity_id, transaction_type, amount, cumulative_amount, reference_no, created_at
            ) VALUES (
                COALESCE((SELECT MAX(transaction_id) + 1 FROM transactions WHERE pocket_id = pocket.pocket_id), 1),
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


