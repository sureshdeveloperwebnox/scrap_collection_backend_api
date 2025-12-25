-- Fix all leads that have a customerId but incorrect status
-- This handles leads that were converted through any method

UPDATE "Lead" 
SET status = 'CONVERTED' 
WHERE "customerId" IS NOT NULL 
  AND status != 'CONVERTED';

-- Also update leads where a customer exists with the same phone number
UPDATE "Lead" l
SET status = 'CONVERTED',
    "customerId" = c.id
FROM "Customer" c
WHERE l.phone = c.phone
  AND l."organizationId" = c."organizationId"
  AND l.status != 'CONVERTED'
  AND l."customerId" IS NULL;
