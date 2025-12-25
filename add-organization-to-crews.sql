-- Add organizationId to crews table
ALTER TABLE crews ADD COLUMN IF NOT EXISTS "organizationId" INTEGER;

-- Set a default organization for existing crews (organization ID 1)
UPDATE crews SET "organizationId" = 1 WHERE "organizationId" IS NULL;

-- Make organizationId required
ALTER TABLE crews ALTER COLUMN "organizationId" SET NOT NULL;

-- Drop the old unique constraint on name
ALTER TABLE crews DROP CONSTRAINT IF EXISTS crews_name_key;

-- Add composite unique constraint (name + organizationId)
ALTER TABLE crews ADD CONSTRAINT crews_name_organizationId_key UNIQUE (name, "organizationId");

-- Add foreign key constraint
ALTER TABLE crews ADD CONSTRAINT crews_organizationId_fkey 
  FOREIGN KEY ("organizationId") REFERENCES "Organization"(id) ON DELETE RESTRICT ON UPDATE CASCADE;
