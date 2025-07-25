CREATE TABLE country_configurations (
  id SERIAL PRIMARY KEY,
  country_code TEXT UNIQUE NOT NULL,     
  country_name TEXT NOT NULL,                 
  currency  TEXT NOT NULL,               
  calling_code INTEGER NOT NULL,                
  languages TEXT[] NOT NULL,                     
  min_deposit NUMERIC NOT NULL,
  max_deposit NUMERIC NOT NULL,
  min_withdrawal NUMERIC NOT NULL,
  max_withdrawal NUMERIC NOT NULL,
  withdrawal_charges TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

GRANT INSERT, SELECT, UPDATE ON country_configurations TO saveup_www;