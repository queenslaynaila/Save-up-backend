# Database Schema

## Table: users
| Column                     | Type          | Constraints                                            | Default         |
|----------------------------|---------------|--------------------------------------------------------|-----------------|
| id                         | UUID          | PRIMARY KEY                                            | uuid_generate_v4() |
| first_name                 | VARCHAR(255)  | NOT NULL                                               |                 |
| last_name                  | VARCHAR(255)  | NOT NULL                                               |                 |
| email                      | VARCHAR(255)  | NOT NULL, UNIQUE                                       |                 |
| phone_no                   | VARCHAR(255)  | UNIQUE, FORMAT CHECK: /^[0-9]{10}$/                    |                 |
| password_hash              | VARCHAR(255)  | NOT NULL                                               |                 |
| total_targeted_amount      | DECIMAL(10, 2)| FORMAT CHECK: ^[0-9]+(?:\.[0-9]{1,2})?$                | 0               |
| total_contributions_amount | DECIMAL(10, 2)| FORMAT CHECK: ^[0-9]+(?:\.[0-9]{1,2})?$                | 0               |
| total_expenses_amount      | DECIMAL(10, 2)| FORMAT CHECK: ^[0-9]+(?:\.[0-9]{1,2})?$                | 0               |
| created_at                 | TIMESTAMP     |                                                        | NOW()           |
| updated_at                 | TIMESTAMP     |                                                        | NOW()           |

## Table: savings
| Column               | Type          | Constraints                                            | Default         |
|----------------------|---------------|--------------------------------------------------------|-----------------|
| id                   | UUID          | PRIMARY KEY                                            | uuid_generate_v4() |
| user_id              | UUID          | REFERENCES users(id) ON DELETE CASCADE                 |                 |
| description          | VARCHAR(255)  | NOT NULL                                               |                 |
| category             | VARCHAR(255)  |                                                        |                 |
| target_amount        | DECIMAL(10, 2)| NOT NULL                                               |                 |
| contributed_amount   | NUMERIC       |                                                        | 0               |
| priority             | VARCHAR(255)  |                                                        |                 |
| status               | VARCHAR(255)  | DEFAULT 'In Progress', FORMAT CHECK: /^(In Progress|Complete)$/ |           |
| target_date          | DATE          |                                                        |                 |
| start_date           | DATE          | DEFAULT CURRENT_DATE                                   |                 |
| created_at           | TIMESTAMP     |                                                        | NOW()           |
| updated_at           | TIMESTAMP     |                                                        | NOW()           |

## Table: contributions
| Column               | Type          | Constraints                                            | Default         |
|----------------------|---------------|--------------------------------------------------------|-----------------|
| id                   | UUID          | PRIMARY KEY                                            | uuid_generate_v4() |
| saving_id            | UUID          | NOT NULL, REFERENCES savings(id) ON DELETE CASCADE     |                 |
| amount               | DECIMAL(10, 2)| NOT NULL                                               |                 |
| date                 | DATE          | NOT NULL                                               |                 |
| created_at           | TIMESTAMP     |                                                        | NOW()           |
| updated_at           | TIMESTAMP     |                                                        | NOW()           |

## Table: expenses
| Column               | Type          | Constraints                                            | Default         |
|----------------------|---------------|--------------------------------------------------------|-----------------|
| id                   | UUID          | PRIMARY KEY                                            | uuid_generate_v4() |
| user_id              | UUID          | REFERENCES users(id) ON DELETE CASCADE                 |                 |
| category             | VARCHAR(255)  | NOT NULL                                               |                 |
| description          | VARCHAR(255)  |                                                        |                 |
| amount               | DECIMAL(10, 2)| NOT NULL                                               |                 |
| date                 | DATE          | NOT NULL                                               |                 |
| month_extracted      | INTEGER       | GENERATED ALWAYS AS (EXTRACT(MONTH FROM date)) STORED  |                 |
| created_at           | TIMESTAMP     |                                                        | NOW()           |
| updated_at           | TIMESTAMP     |                                                        | NOW()           |

## Indexes
- Index `savings_user_id` on `savings(user_id)`
- Index `savings_category` on `savings(category)`
- Index `savings_priority` on `savings(priority)`
- Index `savings_status` on `savings(status)`
- Index `expenses_user_id` on `expenses(user_id)`
- Index `expenses_category` on `expenses(category)`
- Index `expenses_month` on `expenses(month_extracted)`
