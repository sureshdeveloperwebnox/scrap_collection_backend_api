-- Migration: Add billing address and geolocation fields to Organization table
-- Date: 2025-12-24
-- Description: Adds billingAddress, latitude, and longitude fields to support
--              full address management with Google Maps integration

-- Add new columns to Organization table
ALTER TABLE "Organization" 
ADD COLUMN IF NOT EXISTS "billingAddress" TEXT,
ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;

-- Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'Organization'
ORDER BY ordinal_position;
