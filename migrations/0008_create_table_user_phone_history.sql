CREATE TABLE IF NOT EXISTS user_phone_history (
    user_id INT NOT NULL,
    xid INT NOT NULL,
    phone_number TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, xid),
    FOREIGN KEY (user_id) REFERENCES user_contact_details (id)
);

SELECT create_distributed_table('user_phone_history', 'user_id');
GRANT INSERT, SELECT ON user_phone_history TO saveup_www;
