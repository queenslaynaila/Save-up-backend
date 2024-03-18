CREATE TYPE role_enum AS ENUM ('Admin','User','Moderator');
CREATE TYPE status_enum AS ENUM ('In Progress', 'Completed', 'Dormant');
CREATE TYPE priority_enum AS ENUM ('High', 'Intermediate', 'Low');

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  first_name    VARCHAR(100) NOT NULL,
  last_name     VARCHAR(100) NOT NULL,
  phone_number  VARCHAR(13) UNIQUE NOT NULL,
  role          role_enum NOT NULL DEFAULT 'User',
  password      VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT    phone_number_format_check CHECK (phone_number ~* '^\+?254[0-9]{9}$')
);

CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL,
  user_id     INT NOT NULL REFERENCES users (id),
  name        VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (user_id, id)
)

CREATE TABLE IF NOT EXISTS savings (
  id            SERIAL PRIMARY KEY,
  user_id       INT NOT NULL REFERENCES users(id),
  category_id   INT NOT NULL,
  description   VARCHAR(255) NOT NULL,
  amount        NUMERIC(30, 3) NOT NULL,
  priority      priority_enum NOT NULL,
  status        status_enum NOT NULL DEFAULT 'In Progress',
  target_date   TIMESTAMP WITH TIME ZONE NOT NULL,
  start_date    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at  TIMESTAMP WITH TIME ZONE, 
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  FOREIGN KEY   (user_id,category_id) REFERENCES categories( user_id,id) 
);

CREATE  INDEX savings_user_id_idx  ON savings (user_id);
CREATE  INDEX savings_category_idx ON savings (category_id);
CREATE  INDEX savings_priority_idx ON savings (priority);
CREATE  INDEX savings_status_idx   ON savings (status);

CREATE TABLE IF NOT EXISTS security_questions (
  id          SERIAL, 
  user_id     INT NOT NULL REFERENCES users (id), 
  question    VARCHAR(255) NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, id)
);

CREATE TABLE IF NOT EXISTS security_answers (
  id                SERIAL , 
  question_id       INT NOT NULL, 
  user_id           INT NOT NULL REFERENCES users (id), 
  answer            VARCHAR(255) NOT NULL,
  created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  FOREIGN KEY       (user_id,question_id) REFERENCES security_questions( user_id,id),
  PRIMARY KEY       (user_id, question_id)
);

CREATE OR REPLACE FUNCTION check_security_answer_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF (
        SELECT COUNT(*)
        FROM security_answers
        WHERE user_id = NEW.user_id
    ) >= 5 THEN
        RAISE EXCEPTION 'Maximum limit of security answers reached';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_security_answers
BEFORE INSERT ON security_answers
FOR EACH ROW
EXECUTE FUNCTION check_security_answer_limit();

CREATE TABLE IF NOT EXISTS contributions (
  id         SERIAL PRIMARY KEY,
  saving_id  INTEGER NOT NULL REFERENCES savings (id) ON DELETE CASCADE NOT NULL,
  amount     NUMERIC(30, 3) NOT NULL,
  date       TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
  id              SERIAL,
  user_id         INT NOT NULL,
  category_id     INT NOT NULL,
  description     VARCHAR(255),
  amount          NUMERIC(30, 3) NOT NULL,
  expense_date    TIMESTAMP WITH TIME ZONE, 
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY     (user_id, id),
  FOREIGN KEY     (user_id, category_id) REFERENCES categories (user_id, id)
);

CREATE INDEX expenses_user_id_idx ON expenses (user_id);
CREATE INDEX expenses_category_idx ON expenses (category_id);
-- CREATE INDEX expenses_month_idx ON expenses (month);

CREATE TABLE IF NOT EXISTS reset_tokens (
    id          SERIAL PRIMARY KEY,
    user_id     INT REFERENCES users(id),
    token       INTEGER NOT NULL CHECK (token BETWEEN 1000 AND 9999),
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    used_at     TIMESTAMP WITH TIME ZONE,
    expired_at  TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '15 minutes')
);

CREATE OR REPLACE FUNCTION set_expiry_time_default()
RETURNS TRIGGER AS $$
BEGIN
    NEW.expiry_time := NEW.created_at + INTERVAL '15 minutes';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER set_expiry_time_default_trigger
BEFORE INSERT ON reset_tokens
FOR EACH ROW
EXECUTE FUNCTION set_expiry_time_default();


CREATE OR REPLACE FUNCTION check_user_token_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM reset_tokens
        WHERE user_id = NEW.user_id
          AND DATE_TRUNC('day', created_at) = DATE_TRUNC('day', CURRENT_TIMESTAMP)
        HAVING COUNT(*) >= 10
    ) THEN
        RAISE EXCEPTION 'User has reached the maximum token limit for the day';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_user_token_limit
BEFORE INSERT ON reset_tokens
FOR EACH ROW
EXECUTE FUNCTION check_user_token_limit();

ALTER TABLE reset_tokens
ADD CONSTRAINT token_expiry CHECK (expiry_time > created_at + INTERVAL '15 minutes');
