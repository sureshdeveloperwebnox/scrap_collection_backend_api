-- Update existing leads that have a customerId but status is not CONVERTED
UPDATE "Lead" 
SET status = 'CONVERTED' 
WHERE "customerId" IS NOT NULL 
  AND status != 'CONVERTED';
