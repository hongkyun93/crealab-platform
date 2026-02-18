-- Add channels column to life_moments table (correct table name)
ALTER TABLE life_moments
ADD COLUMN IF NOT EXISTS channels text[] DEFAULT '{}';

-- Add index for better search performance
CREATE INDEX IF NOT EXISTS idx_life_moments_channels
ON life_moments USING GIN (channels);

-- Add channels column to brand_products table
ALTER TABLE brand_products
ADD COLUMN IF NOT EXISTS channels text[] DEFAULT '{}';

-- Add index for better search performance
CREATE INDEX IF NOT EXISTS idx_brand_products_channels
ON brand_products USING GIN (channels);

-- Set default empty array for existing rows (if NULL)
UPDATE life_moments
SET channels = '{}'
WHERE channels IS NULL;

UPDATE brand_products
SET channels = '{}'
WHERE channels IS NULL;
