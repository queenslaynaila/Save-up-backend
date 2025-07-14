CREATE TABLE IF NOT EXISTS donation_pockets (
    entity_id INT NOT NULL,
    pocket_id INT NOT NULL,
    description TEXT,
    images TEXT [],
    FOREIGN KEY (entity_id, pocket_id) REFERENCES pockets (entity_id, xid)
);

SELECT create_distributed_table('donation_pockets', 'entity_id');
GRANT INSERT, SELECT, UPDATE ON donation_pockets TO saveup_www;
