CREATE TABLE IF NOT EXISTS interest_rates(
  pocket_type   enum_pocket_type,
  rate          DECIMAL(4,2)
);

GRANT INSERT, SELECT, UPDATE ON interest_rates TO saveup_www;