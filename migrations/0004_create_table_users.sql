DO $$
BEGIN
  CREATE TYPE enum_id_type  AS ENUM ('National', 'Passport');
  CREATE TYPE enum_user_role AS ENUM ('Admin', 'Standard', 'Moderator');
  CREATE TYPE enum_gender AS ENUM ('Male', 'Female');
  CREATE TYPE enum_user_status AS ENUM ('Active', 'Inactive', 'Suspended');
EXCEPTION
  WHEN DUPLICATE_OBJECT THEN NULL;
END
$$;

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY,
    id_type enum_id_type  NOT NULL DEFAULT 'National',
    id_number TEXT NOT NULL CHECK (id_number ~ '^[0-9]+$'),
    role enum_user_role NOT NULL DEFAULT 'Standard',
    country TEXT NOT NULL,
    gender enum_gender,
    pin TEXT NOT NULL,
    status enum_user_status  NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
er
);

GRANT INSERT, SELECT, UPDATE ON users TO saveup_www;
SELECT create_distributed_table('users', 'id');
