-- Add ORD-1010 for Boobalan
INSERT INTO orders (
    customer_id,
    order_number,
    status,
    ordered_at,
    expected_delivery_at,
    tracking_status
)
SELECT
    id,
    'ORD-1010',
    'cancelled',
    NOW() - INTERVAL '2 days',
    DATE '2026-11-20',
    'cancelled'
FROM users
WHERE email = 'boobalan46@gmail.com'
ON CONFLICT DO NOTHING;
