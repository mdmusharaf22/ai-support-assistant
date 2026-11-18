-- First, temporarily disable the constraint by dropping it
ALTER TABLE tickets 
DROP CONSTRAINT IF EXISTS tickets_issue_type_check;

-- Update existing tickets to use the new issue_type values
UPDATE tickets 
SET issue_type = 'order_issue' 
WHERE issue_type = 'order';

UPDATE tickets 
SET issue_type = 'payment_issue' 
WHERE issue_type = 'payment';

-- Now add the updated constraint
ALTER TABLE tickets
ADD CONSTRAINT tickets_issue_type_check 
CHECK (issue_type IN (
    'order_issue', 
    'payment_issue', 
    'general_inquiry', 
    'technical_issue', 
    'other'
));
