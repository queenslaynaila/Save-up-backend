CREATE TABLE IF NOT EXISTS interest_rates (
    id SERIAL PRIMARY KEY,
    pocket_type enum_pocket_type UNIQUE,
    rate decimal(4, 2)
);

GRANT INSERT, SELECT, UPDATE ON interest_rates TO saveup_www;