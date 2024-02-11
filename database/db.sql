BEGIN TRANSACTION;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_no VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS savings (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      description VARCHAR(255) NOT NULL,
      category VARCHAR(255),
      target_amount DECIMAL(10, 2) NOT NULL,
      contributed_amount NUMERIC DEFAULT 0,
      priority VARCHAR(255),
      status VARCHAR(255) DEFAULT 'In Progress',
      target_date DATE,
      start_date DATE DEFAULT CURRENT_DATE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contributions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      saving_id UUID REFERENCES savings(id) ON DELETE CASCADE,
      amount DECIMAL(10, 2) NOT NULL,
      date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      category VARCHAR(255) NOT NULL,
      description VARCHAR(255),
      amount DECIMAL(10, 2) NOT NULL,
      date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
);



COMMIT;

