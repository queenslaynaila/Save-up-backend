CREATE TABLE interest_job_summary (
    id SERIAL PRIMARY KEY,
    interest_date DATE NOT NULL UNIQUE,
    standard_interest_rate NUMERIC(3, 2) NOT NULL,
    locked_interest_rate NUMERIC(3, 2) NOT NULL,
    -- Total eligible pockets found
    total_eligible_pockets INTEGER NOT NULL,
    awarded_pockets INTEGER NOT NULL DEFAULT 0, -- Successfully awarded interest
    skipped_pockets INTEGER NOT NULL,      -- Eligible but interest was ~0 
    failed_pockets INTEGER NOT NULL DEFAULT 0, -- Errors during processing
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
