-- Add ORD-1009 for Boobalan (customer_id = 25)
INSERT INTO orders (customer_id, order_number, status, ordered_at, expected_delivery_at, tracking_status)
VALUES (25, 'ORD-1009', 'cancelled', NOW() - INTERVAL '3 days', CURRENT_DATE + INTERVAL '2 days', 'cancelled')
ON CONFLICT (order_number) DO NOTHING;

-- Add payment for ORD-1009
INSERT INTO payments (order_id, customer_id, transaction_reference, amount, currency, status)
SELECT o.id, 25, 'TXN-1009', 1999.00, 'INR', 'success'
FROM orders o
WHERE o.order_number = 'ORD-1009'
ON CONFLICT (transaction_reference) DO NOTHING;
