CREATE TABLE IF NOT EXISTS user_identities (
  id    uuid7 DEFAULT uuidv7() PRIMARY KEY,
  phone phone_number NOT NULL UNIQUE
);

GRANT INSERT, SELECT ON user_identities TO saveup_www;

SELECT create_reference_table('user_identities');
