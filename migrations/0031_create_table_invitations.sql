DO $$
BEGIN
  CREATE TYPE enum_invite AS ENUM ('Pending', 'Accept', 'Decline');
EXCEPTION
  WHEN DUPLICATE_OBJECT THEN NULL;
END
$$;

CREATE TABLE IF NOT EXISTS invitations (
    group_id INT NOT NULL,
    receiver_id INT,
    phone_number TEXT,
    sender_id INT NOT NULL,
    xid INT NOT NULL,
    status enum_invite NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (group_id, xid),
    FOREIGN KEY (group_id) REFERENCES groups (id),
    FOREIGN KEY (receiver_id) REFERENCES entities (id),
    FOREIGN KEY (sender_id) REFERENCES entities (id)
);
SELECT create_distributed_table('invitations', 'group_id');

CREATE UNIQUE INDEX invitations_group_id_receiver_id_phone_key
ON invitations (group_id, COALESCE(receiver_id::TEXT, phone_number))
WHERE deleted_at IS NULL;

GRANT INSERT, SELECT, UPDATE ON invitations TO saveup_www;
