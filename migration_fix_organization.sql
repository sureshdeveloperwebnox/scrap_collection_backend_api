-- Add billingAddress column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Organization' 
        AND column_name = 'billingAddress'
    ) THEN
        ALTER TABLE "Organization" ADD COLUMN "billingAddress" TEXT;
    END IF;
END $$;

-- Make countryId optional (nullable)
ALTER TABLE "Organization" ALTER COLUMN "countryId" DROP NOT NULL;
