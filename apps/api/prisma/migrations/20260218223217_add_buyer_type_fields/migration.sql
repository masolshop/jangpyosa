-- AlterTable Company: Add buyerType field
ALTER TABLE Company ADD COLUMN buyerType TEXT;

-- AlterTable BuyerProfile: Add hasLevyExemption field
ALTER TABLE BuyerProfile ADD COLUMN hasLevyExemption INTEGER NOT NULL DEFAULT 0;

-- Update existing data: Set default buyerType for existing BUYER companies
-- Note: companyType is stored in User table, not Company table
-- We'll update this via API/script after migration
