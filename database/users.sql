-- TOP MANAGEMENT USER
CREATE USER db_management_user WITH PASSWORD 'mimiNimangement@2024';
GRANT ALL PRIVILEGES ON DATABASE saveupapi TO db_management_user;

===============================================================================================

-- ADMIN USER
CREATE USER admin_user WITH PASSWORD 'mimiNdiyeAdminWaSaveup@2024';

--Read Only pemissions
GRANT SELECT ON next_of_kins, groups, user_groups, group_administrators, nomination_approvals TO admin_user;

--Write only permissions
GRANT INSERT ON categories, security_questions, interest_rates TO admin_user;

--Read Write permissions
GRANT SELECT, INSERT ON savings, external_savings, withdrawals, transfers TO admin_user;

--Read Delete Permisons
GRANT SELECT, DELETE ON security_answers TO admin_user;

--Write, Read, Update, Delete Permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON user_contacts, transaction_logs TO admin_user;

==================================================================================================

-- STANDARD USER
CREATE USER app_user WITH PASSWORD 'mimiNdiyeStandardUserWaSaveup@2024';

-- Grant create-only permissions
GRANT INSERT ON entities, reset_tokens TO app_user;

-- Grant read-only permissions on read-only tables
GRANT SELECT ON categories, security_questions, users, interest_rates, transaction_logs TO app_user;

-- Grant create and read-only permissions
GRANT SELECT, INSERT ON nominations_approvals, savings, external_savings, withdrawals, transfers TO app_user;

-- Grant read and update permissions
GRANT SELECT, UPDATE ON user_groups, next_of_kins TO app_user;

-- Grant create, read, and update permissions
GRANT INSERT, SELECT, UPDATE ON user_contact_details, invitations, expenses, pockets TO app_user;

-- Grant create and update permissions
GRANT INSERT, UPDATE ON security_answers TO app_user;
