CREATE TABLE IF NOT EXISTS user_id_history (
    user_id INT NOT NULL,
    xid INT NOT NULL,
    id_type enum_id_type  NOT NULL DEFAULT 'National',
    id_number TEXT NOT NULL CHECK (id_number ~ '^[0-9]+$'),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, xid),
    FOREIGN KEY (user_id) REFERENCES user_contact_details (id)
);

SELECT create_distributed_table('user_id_history', 'user_id');
GRANT INSERT, SELECT ON user_id_history TO saveup_www;
