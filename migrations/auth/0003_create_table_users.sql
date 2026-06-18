CREATE TYPE user_role AS ENUM ('super-admin', 'admin', 'moderator', 'standard');
CREATE TYPE user_gender AS ENUM ('male', 'female');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');

-- No need to store name, created_at, and phone in the users table as they can be accessed via joins.
-- name, created_at can be accessed via core.entities table
-- phone can be accessed via users.user_identities table
CREATE TABLE IF NOT EXISTS users (
  id             uuid7 PRIMARY KEY,
  country        TEXT        NOT NULL,
  gender         user_gender,
  status         user_status NOT NULL DEFAULT 'active',
  role           user_role   NOT NULL DEFAULT 'standard',
  -- The identification field will store with a prefix to indicate the type of identification.
  -- 'N:' for National ID and 'P:' for Passport.
  -- The CHECK constraint ensures that the value follows the expected format.
  -- Example: 'N:123456789' for National ID and 'P:AB1234567' for Passport.
  identification TEXT        NOT NULL CHECK (identification ~ '^(N|P):[A-Z0-9]+$'),
  pin            TEXT        NOT NULL,
  FOREIGN KEY (id) REFERENCES user_identities ON DELETE RESTRICT ON UPDATE RESTRICT,
  FOREIGN KEY (id) REFERENCES entities ON DELETE RESTRICT ON UPDATE RESTRICT
);

GRANT INSERT, SELECT, UPDATE ON users TO saveup_www;

SELECT create_distributed_table('users', 'id');
