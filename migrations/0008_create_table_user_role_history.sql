CREATE TABLE IF NOT EXISTS user_role_history (
    user_id INT NOT NULL,
    xid INT NOT NULL,
    admin_id INT NOT NULL,
    role enum_user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, xid),
    FOREIGN KEY (user_id) REFERENCES user_contact_details (id),
    FOREIGN KEY (admin_id) REFERENCES user_contact_details (id)
);

SELECT create_distributed_table('user_role_history', 'user_id');
GRANT INSERT, SELECT ON user_role_history TO saveup_www;
