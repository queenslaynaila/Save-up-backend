CREATE TYPE enum_status AS ENUM ('In Progress', 'Completed');
CREATE TYPE enum_priority AS ENUM ('High', 'Intermediate', 'Low');
CREATE TYPE enum_pocket_type AS ENUM ('Standard', 'Locked');

CREATE TABLE IF NOT EXISTS pockets ( 
  entity_id               INT NOT NULL, 
  ex_id                   INT NOT NULL,
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
  PRIMARY KEY             (entity_id, ex_id), 
  FOREIGN KEY             (entity_id) REFERENCES entities(id),
  FOREIGN KEY             (category_id) REFERENCES categories(id)
);

GRANT INSERT, SELECT, UPDATE ON pockets TO app_user;
SELECT create_distributed_table('pockets', 'ex_id');