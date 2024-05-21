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
