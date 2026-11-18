-- Insert demo orders
INSERT INTO orders (
    customer_id,
    order_number,
    status,
    ordered_at,
    expected_delivery_at,
    tracking_status
)
SELECT
    (SELECT id FROM users WHERE email = 'customer1@example.com'),
    'ORD-1001',
    'shipped',
    NOW() - INTERVAL '3 days',
    DATE '2026-10-27',
    'in_transit'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE order_number = 'ORD-1001');

INSERT INTO orders (
    customer_id,
    order_number,
    status,
    ordered_at,
    expected_delivery_at,
    tracking_status
)
SELECT
    (SELECT id FROM users WHERE email = 'customer1@example.com'),
    'ORD-1002',
    'delayed',
    NOW() - INTERVAL '7 days',
    DATE '2026-10-25',
    'delayed'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE order_number = 'ORD-1002');

INSERT INTO orders (
    customer_id,
    order_number,
    status,
    ordered_at,
    expected_delivery_at,
    tracking_status
)
SELECT
    (SELECT id FROM users WHERE email = 'customer2@example.com'),
    'ORD-1003',
    'delivered',
    NOW() - INTERVAL '10 days',
    DATE '2026-10-20',
    'delivered'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE order_number = 'ORD-1003');

-- Insert demo payments
INSERT INTO payments (
    order_id,
    customer_id,
    transaction_reference,
    amount,
    currency,
    status,
    created_at
)
SELECT
    (SELECT id FROM orders WHERE order_number = 'ORD-1001'),
    (SELECT customer_id FROM orders WHERE order_number = 'ORD-1001'),
    'TXN-2001',
    1499.00,
    'INR',
    'success',
    NOW() - INTERVAL '3 days'
WHERE NOT EXISTS (SELECT 1 FROM payments WHERE transaction_reference = 'TXN-2001');

INSERT INTO payments (
    order_id,
    customer_id,
    transaction_reference,
    amount,
    currency,
    status,
    created_at
)
SELECT
    (SELECT id FROM orders WHERE order_number = 'ORD-1002'),
    (SELECT customer_id FROM orders WHERE order_number = 'ORD-1002'),
    'TXN-2002',
    2499.00,
    'INR',
    'success',
    NOW() - INTERVAL '7 days'
WHERE NOT EXISTS (SELECT 1 FROM payments WHERE transaction_reference = 'TXN-2002');

INSERT INTO payments (
    order_id,
    customer_id,
    transaction_reference,
    amount,
    currency,
    status,
    created_at
)
SELECT
    (SELECT id FROM orders WHERE order_number = 'ORD-1003'),
    (SELECT customer_id FROM orders WHERE order_number = 'ORD-1003'),
    'TXN-2003',
    999.00,
    'INR',
    'success',
    NOW() - INTERVAL '10 days'
WHERE NOT EXISTS (SELECT 1 FROM payments WHERE transaction_reference = 'TXN-2003');

-- Duplicate payment for testing
INSERT INTO payments (
    order_id,
    customer_id,
    transaction_reference,
    amount,
    currency,
    status,
    created_at
)
SELECT
    (SELECT id FROM orders WHERE order_number = 'ORD-1003'),
    (SELECT customer_id FROM orders WHERE order_number = 'ORD-1003'),
    'TXN-2004',
    999.00,
    'INR',
    'success',
    NOW() - INTERVAL '10 days' + INTERVAL '10 seconds'
WHERE NOT EXISTS (SELECT 1 FROM payments WHERE transaction_reference = 'TXN-2004');

-- Insert demo tickets
INSERT INTO tickets (
    customer_id,
    assigned_agent_id,
    subject,
    description,
    issue_type,
    status
)
SELECT
    (SELECT id FROM users WHERE email = 'customer1@example.com'),
    (SELECT id FROM users WHERE email = 'agent@example.com'),
    'Order delivery delayed',
    'My order has not arrived yet. Please check the delivery status.',
    'order_issue',
    'open'
WHERE NOT EXISTS (
    SELECT 1 FROM tickets 
    WHERE subject = 'Order delivery delayed' 
    AND customer_id = (SELECT id FROM users WHERE email = 'customer1@example.com')
);

INSERT INTO tickets (
    customer_id,
    assigned_agent_id,
    subject,
    description,
    issue_type,
    status
)
SELECT
    (SELECT id FROM users WHERE email = 'customer2@example.com'),
    (SELECT id FROM users WHERE email = 'agent@example.com'),
    'Possible duplicate payment',
    'I think I was charged twice for the same order.',
    'payment_issue',
    'in_progress'
WHERE NOT EXISTS (
    SELECT 1 FROM tickets 
    WHERE subject = 'Possible duplicate payment' 
    AND customer_id = (SELECT id FROM users WHERE email = 'customer2@example.com')
);
