-- Add 300,000₮ initial balance to all existing wallets
UPDATE wallets SET balance = balance + 300000;

-- For new wallets, set default balance to 300,000₮
ALTER TABLE wallets ALTER COLUMN balance SET DEFAULT 300000;
