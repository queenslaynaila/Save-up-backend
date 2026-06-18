-- TODO: How do we handle user defined categories?
--  Do we need a separate table for user defined categories,
--  or can we just have a flag in the categories table to indicate whether a category is user defined or not?
--  For now, we'll just support system defined categories only,
--  and we can add support for user defined categories later if needed.
CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL PRIMARY KEY,
  name        TEXT        NOT NULL,
  description TEXT        NOT NULL,
  image_url   TEXT,
  created_at  timestamptz NOT NULL DEFAULT NOW(),
  deleted_at  timestamptz
);

SELECT create_reference_table('categories');
GRANT USAGE ON categories_id_seq TO saveup_www;

GRANT SELECT, INSERT ON categories TO saveup_www;
