-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'customer'
        CHECK (role IN ('customer', 'agent', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES users(id),
    order_number VARCHAR(30) NOT NULL UNIQUE,
    status VARCHAR(30) NOT NULL
        CHECK (status IN (
            'placed', 'processing', 'shipped',
            'delayed', 'delivered', 'cancelled'
        )),
    ordered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expected_delivery_at DATE,
    tracking_status VARCHAR(30),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id),
    customer_id BIGINT NOT NULL REFERENCES users(id),
    transaction_reference VARCHAR(100) NOT NULL UNIQUE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    currency CHAR(3) NOT NULL DEFAULT 'INR',
    status VARCHAR(20) NOT NULL
        CHECK (status IN (
            'pending', 'success', 'failed', 'refunded'
        )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tickets table
CREATE TABLE IF NOT EXISTS tickets (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES users(id),
    assigned_agent_id BIGINT REFERENCES users(id),
    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    issue_type VARCHAR(30) NOT NULL
        CHECK (issue_type IN (
            'order', 'payment', 'other'
        )),
    status VARCHAR(20) NOT NULL DEFAULT 'open'
        CHECK (status IN (
            'open', 'in_progress', 'resolved', 'closed'
        )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI Investigations table
CREATE TABLE IF NOT EXISTS ai_investigations (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ticket_id BIGINT NOT NULL REFERENCES tickets(id),
    tool_name VARCHAR(50) NOT NULL
        CHECK (tool_name IN (
            'lookupOrder', 'investigatePayments'
        )),
    tool_result JSONB NOT NULL DEFAULT '{}'::JSONB,
    recommendation TEXT,
    model_name VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_customer ON tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_agent_status ON tickets(assigned_agent_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_created ON payments(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_investigations_ticket ON ai_investigations(ticket_id);
CREATE INDEX IF NOT EXISTS idx_orders_delivery ON orders(status, expected_delivery_at);
