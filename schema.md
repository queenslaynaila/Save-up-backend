## Database Schema

### Table: users

| Column Name    | Data Type | Constraints                 |
|----------------|-----------|-----------------------------|
| id             | UUID    | Primary Key                 |
| first_name     | VARCHAR   | Not Null                    |
| last_name      | VARCHAR   | Not Null                    |
| email          | VARCHAR   | Not Null, Unique            |
| phone_no       | VARCHAR   | Unique                      |
| password_hash  | VARCHAR   | Not Null                    |
| created_at     | TIMESTAMP | Default: `now()`            |
| updated_at     | TIMESTAMP | Default: `now()`            |


### Table: savings

| Column Name        | Data Type | Constraints                                                                                                   |
|--------------------|-----------|---------------------------------------------------------------------------------------------------------------|
| id                 | UUID       | Primary Key                                                                                                   |
| user_id            | UUID       | Foreign Key (References: users.id, On Delete: Cascade)                                                         |
| description        | varchar   | Not Null                                                                                                      |
| category           | varchar   |                                                                                                               |
| targetAmount       | decimal   | Not Null                                                                                                      |
| contributedAmount  | numeric   | Default: 0, Note: Total amount contributed towards the saving goal. Updated whenever there is a corresponding update in the contributions table |
| priority           | varchar   | Note: Priority of the saving goal: High, Low, Intermediate                                                     |
| status             | varchar   | Default: 'In Progress', Note: Status of the saving goal: In Progress or Complete                               |
| targetDate         | date      |                                                                                                               |
| startDate          | date      | Default: `current_date`                                                                                      |
| created_at         | timestamp | Default: `now()`                                                                                             |
| updated_at         | timestamp | Default: `now()`                                                                                             |

### Table: contributions

| Column Name | Data Type | Constraints                                                      |
|-------------|-----------|------------------------------------------------------------------|
| id          | UUID       | Primary Key                                                      |
| saving_id   | UUID       | Foreign Key (References: savings.id, On Delete: Cascade)          |
| amount      | decimal   | Not Null  Note:An updated to it updates the contrbted amount cumulatively in savings table.                                       |
| date        | date      | Not Null                                                         |
| created_at  | timestamp | Default: `now()`                                                 |
| updated_at  | timestamp | Default: `now()`                                                 |

### Table: expenses

| Column Name | Data Type | Constraints                 |
|-------------|-----------|-----------------------------|
| id          | UUID       | Primary Key                 |
| user_id     | UUID       | Foreign Key (References: users.id, On Delete: Cascade) |
| category    | varchar   | Not Null                    |
| description   | varchar   |                    |
| amount      | decimal   | Not Null                    |
| date        | date      | Not Null                    |
| created_at  | timestamp | Default: `now()`            |
| updated_at  | timestamp | Default: `now()`            |
