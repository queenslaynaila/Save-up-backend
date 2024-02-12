BEGIN TRANSACTION;

ALTER TABLE contributions
ALTER COLUMN saving_id SET NOT NULL;

ALTER TABLE users
ADD CONSTRAINT email_format_check
CHECK (email ~* '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')

ADD CONSTRAINT phone_no_format_check
CHECK (phone_no ~* '^[0-9]{10}$')

ALTER TABLE savings
ADD CONSTRAINT status_check
CHECK (status IN ('In Progress', 'Complete'));



COMMIT