CREATE TABLE IF NOT EXISTS interest_job_failures (
    id SERIAL PRIMARY KEY,
    job_name VARCHAR(100) NULL,
    entity_id INT NULL,  --entityid and pocket id valid for only individul pocket  failures
    pocket_id INT NULL,
    standard_interest_rate NUMERIC(5, 4) NULL,
    locked_interest_rate NUMERIC(5, 4) NULL,
    error TEXT NOT NULL,
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    next_attempt_at TIMESTAMPTZ
);

GRANT INSERT, SELECT ON interest_job_failures TO saveup_www;
