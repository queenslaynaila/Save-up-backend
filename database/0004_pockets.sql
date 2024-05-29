CREATE TYPE enum_status AS ENUM ('In Progress', 'Completed');
CREATE TYPE enum_priority AS ENUM ('High', 'Intermediate', 'Low');
CREATE TYPE enum_pocket_type AS ENUM ('Standard', 'Locked');

-- As pockets references the reference table to categories create it 
-- and all tables referrencing it in one single transaction 
-- as when there is a foreign key to a reference table, Citus 
-- needs to perform all operations over a single connection to ensure consistency

CREATE TABLE IF NOT EXISTS pockets ( 
  entity_id               INT NOT NULL, 
  xid                     INT NOT NULL,
  category_id             INT NOT NULL,
  name                    TEXT,
  priority                enum_priority NOT NULL DEFAULT 'Intermediate',
  status                  enum_status NOT NULL DEFAULT 'In Progress',
  pocket_type             enum_pocket_type NOT NULL DEFAULT 'Standard',

  -- TODO: Should these be moved to a separate table?
  target_amount           NUMERIC(30, 2) NOT NULL DEFAULT 0,
  target_at               TIMESTAMP WITH TIME ZONE,
  completed_at            TIMESTAMP WITH TIME ZONE, 

  created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at              TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY             (entity_id, xid), 
  FOREIGN KEY             (entity_id) REFERENCES entities(id),
  FOREIGN KEY             (category_id) REFERENCES categories(id)
);

SELECT create_distributed_table('pockets', 'entity_id');
GRANT INSERT, SELECT, UPDATE ON pockets TO app_user;

CREATE TABLE IF NOT EXISTS default_pockets ( 
  entity_id               INT PRIMARY KEY, 
  pocket_id               INT NOT NULL,
  FOREIGN KEY             (entity_id, pocket_id) REFERENCES pockets(entity_id, xid)
);

GRANT INSERT, SELECT ON pockets TO app_user;
SELECT create_distributed_table('default_pockets', 'entity_id');

CREATE TABLE IF NOT EXISTS pocket_reminders ( 
  entity_id               INT PRIMARY KEY, 
  pocket_id               INT NOT NULL,
  reason                  TEXT,
  created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  FOREIGN KEY             (entity_id, pocket_id) REFERENCES pockets(entity_id, xid)
);

SELECT create_distributed_table('pocket_reminders', 'entity_id');
GRANT INSERT, SELECT, UPDATE ON pockets TO app_user;

CREATE TABLE IF NOT EXISTS savings (
  entity_id             INT NOT NULL, 
  xid                   INT NOT NULL,
  pocket_id             INT NOT NULL,
  user_id               INT NOT NULL, 
  amount                NUMERIC(30, 2) NOT NULL CHECK (amount > 0),
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY           (entity_id, xid),
  FOREIGN KEY           (entity_id, pocket_id) REFERENCES pockets (entity_id, xid)
);

SELECT create_distributed_table('savings', 'entity_id');
GRANT INSERT, SELECT ON savings TO app_user;

CREATE TABLE IF NOT EXISTS external_savings (
  entity_id             INT NOT NULL,-- owner of the pocket
  xid                   INT NOT NULL,
  donor_id              INT NOT NULL, -- the donor
  pocket_id             INT NOT NULL, --the pocket itself                                                                                                                                                                
  amount                NUMERIC(30, 2) NOT NULL,
  show_details          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY           (entity_id, xid),
  FOREIGN KEY           (entity_id, pocket_id) REFERENCES pockets (entity_id, xid)
);

GRANT INSERT, SELECT ON external_savings TO app_user;
SELECT create_distributed_table('external_savings', 'entity_id');