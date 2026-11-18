# AI Support Resolution Assistant - Backend

Node.js + Express backend with PostgreSQL and OpenAI integration for AI-powered support ticket resolution.

## Features

- **Authentication**: JWT-based auth with role-based access control
- **Ticket Management**: Create, view, and manage support tickets
- **AI Investigation**: Two AI-powered tools:
  - `lookupOrder`: Retrieve order status and delivery information
  - `investigatePayments`: Detect possible duplicate payments
- **Dashboard**: Ticket statistics and summaries
- **Authorization**: Secure data access based on customer ownership

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- OpenAI API key

### Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your credentials:
```env
PORT=5000
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/ai_support_assistant
JWT_SECRET=your_jwt_secret_here
OPENAI_API_KEY=your_openai_key_here
OPENAI_MODEL=gpt-4-turbo-preview
FRONTEND_URL=http://localhost:5173
```

4. Create PostgreSQL database:
```sql
CREATE DATABASE ai_support_assistant;
```

5. Run migrations:
```bash
npm run migrate
```

6. Seed demo data:
```bash
npm run seed
```

### Running

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user (requires auth)

### Tickets
- `GET /api/v1/tickets` - List tickets
- `GET /api/v1/tickets/:id` - Get ticket details
- `POST /api/v1/tickets` - Create ticket
- `PATCH /api/v1/tickets/:id/status` - Update ticket status (agents only)

### AI Investigation
- `POST /api/v1/ai/tickets/:id/investigate` - Run AI investigation (agents only)

### Dashboard
- `GET /api/v1/dashboard/summary` - Get dashboard statistics (agents only)

## Demo Users

After seeding, these users are available:

| Email | Password | Role |
|-------|----------|------|
| customer1@example.com | password123 | customer |
| customer2@example.com | password123 | customer |
| agent@example.com | password123 | agent |
| admin@example.com | password123 | admin |

## Project Structure

```
backend/
├── src/
│   ├── config/          # Database and environment config
│   ├── routes/          # API route definitions
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── ai/              # AI tool definitions and executors
│   ├── repositories/    # Database queries
│   ├── middleware/      # Auth, validation, error handling
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── migrations/          # Database schema
├── seeds/               # Demo data
└── tests/               # Test files (TBD)
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based authorization
- Customer data access controls
- Parameterized database queries
- Helmet.js security headers
- CORS configuration

## AI Tool Workflow

1. Agent creates or views a ticket
2. Agent triggers AI investigation via API
3. Backend sends customer message to OpenAI with tool definitions
4. AI decides which tools to use (lookupOrder, investigatePayments)
5. Backend executes requested tools with proper authorization
6. Backend sends tool results back to AI
7. AI generates evidence-based recommendation
8. Investigation is saved to database
9. Response returned to agent

## Development Notes

- Use ESM modules (`import`/`export`)
- All database queries use parameterized statements
- Customer authorization checked before tool execution
- AI never has direct database access
- Tool results are logged in `ai_investigations` table
