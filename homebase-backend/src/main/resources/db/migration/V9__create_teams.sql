CREATE TABLE teams (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100)  NOT NULL,
    description VARCHAR(255),
    category    VARCHAR(20)   NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

INSERT INTO teams (name, description, category) VALUES
    ('IT Support Team',          'Handles hardware, software, network, and device issues across the store',          'IT'),
    ('Facilities Maintenance',   'Manages physical store environment, equipment, and safety concerns',              'FACILITIES'),
    ('HR Operations',            'Handles employee onboarding, scheduling, benefits, and workplace relations',      'HR'),
    ('Supply Chain & Logistics', 'Manages inventory, supply orders, stock levels, and receiving',                  'SUPPLY'),
    ('General Operations',       'Handles cross-functional and miscellaneous store operations requests',            'OTHER');
