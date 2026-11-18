-- Add order_number column to tickets table
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS order_number VARCHAR(30);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tickets_order_number ON tickets(order_number);
