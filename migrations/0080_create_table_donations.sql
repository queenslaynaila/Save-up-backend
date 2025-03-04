
CREATE TABLE IF NOT EXISTS donations (
    entity_id          INT NOT NULL,  -- Owner of the pocket receiving the donation
    transaction_id     INT NOT NULL,  -- xid from transactions table
    donor_id           INT,            -- If the donor is a registered user
    donor_name         TEXT,           -- If the donor is not registered
    donor_phone        TEXT,           -- for non-registered donors
    PRIMARY KEY       (entity_id, transaction_id),
    FOREIGN KEY       (entity_id, transaction_id) REFERENCES transactions (entity_id, xid)
);

SELECT create_distributed_table('donations', 'entity_id');
GRANT INSERT, SELECT ON donations TO saveup_www;