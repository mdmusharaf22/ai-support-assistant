-- Quick test orders for AI Investigation
-- Run this after truncating tables

-- Order for Boobalan (customer_id = 25)
INSERT INTO orders (customer_id, order_number, status, ordered_at, expected_delivery_at, tracking_status)
VALUES 
(25, 'ORD-1002', 'cancelled', NOW() - INTERVAL '3 days', CURRENT_DATE + INTERVAL '2 days', 'cancelled'),
(25, 'ORD-1001', 'shipped', NOW() - INTERVAL '5 days', CURRENT_DATE + INTERVAL '3 days', 'in_transit'),
(25, 'ORD-1003', 'delayed', NOW() - INTERVAL '7 days', CURRENT_DATE - INTERVAL '1 day', 'delayed')
ON CONFLICT (order_number) DO NOTHING;

-- Payments for the orders
INSERT INTO payments (order_id, customer_id, transaction_reference, amount, currency, status)
SELECT 
    o.id,
    25,
    'TXN-' || o.order_number,
    1999.00,
    'INR',
    'success'
FROM orders o
WHERE o.order_number IN ('ORD-1001', 'ORD-1002', 'ORD-1003')
ON CONFLICT (transaction_reference) DO NOTHING;
