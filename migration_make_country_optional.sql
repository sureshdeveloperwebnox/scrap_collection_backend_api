-- Make countryId optional in Organization table
ALTER TABLE "Organization" ALTER COLUMN "countryId" DROP NOT NULL;
