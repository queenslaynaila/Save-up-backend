DO
$$
  BEGIN
    CREATE TYPE enum_pocket_type AS ENUM ('Standard', 'Locked');
    CREATE TYPE enum_priority AS ENUM ('High', 'Intermediate', 'Low');
    CREATE TYPE enum_status AS ENUM ('In Progress', 'Completed');
  EXCEPTION
    WHEN DUPLICATE_OBJECT THEN NULL;
  END
$$; 

CREATE TABLE IF NOT EXISTS pockets ( 
  entity_id               INT NOT NULL, 
  xid                     INT NOT NULL,
  category_id             INT NOT NULL,
  name                    TEXT,
  pocket_type             enum_pocket_type NOT NULL DEFAULT 'Standard',
  priority                enum_priority NOT NULL DEFAULT 'Intermediate',
  status                  enum_status NOT NULL DEFAULT 'In Progress',
  target_amount           NUMERIC(30, 2) NOT NULL DEFAULT 0,
  target_at               TIMESTAMP WITH TIME ZONE CHECK (target_at > NOW()),
  completed_at            TIMESTAMP WITH TIME ZONE, 
  created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at              TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY             (entity_id, xid), 
  FOREIGN KEY             (entity_id) REFERENCES entities(id),
  FOREIGN KEY             (category_id) REFERENCES categories(id)
);

SELECT create_distributed_table('pockets', 'entity_id');
GRANT INSERT, SELECT, UPDATE ON pockets TO saveup_www;