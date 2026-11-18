# AI Support Resolution Assistant

A full-stack AI-powered support ticketing system that uses AI tool calling to automatically investigate order and payment issues.

## 🎯 Overview

This application demonstrates how AI can assist support agents by:
- **Order Lookup**: Automatically retrieving order status and delivery information
- **Payment Investigation**: Detecting possible duplicate charges with rule-based logic

The AI uses OpenAI's function calling to request the right tools, while your backend enforces authorization and executes the business logic.

## 🏗️ Architecture

**Modular Monolith**
- **Frontend**: React + Vite (Port 5173)
- **Backend**: Node.js + Express (Port 5000)
- **Database**: PostgreSQL
- **AI**: OpenAI GPT-4 with function calling

```
┌─────────────┐      ┌──────────────┐      ┌────────────┐
│   React     │─────▶│  Express API │─────▶│ PostgreSQL │
│   Frontend  │      │   + AI Tools │      │  Database  │
└─────────────┘      └──────────────┘      └────────────┘
                            │
                            ▼
                      ┌──────────┐
                      │ OpenAI   │
                      │ API      │
                      └──────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- OpenAI API key

### 1. Clone and Setup

```bash
cd ai-support-assistant
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your credentials

# Create database
createdb ai_support_assistant

# Run migrations and seed data
npm run migrate
npm run seed

# Start backend
npm run dev
```

Backend runs on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install

# Create .env file
cp .env.example .env

# Start frontend
npm run dev
```

Frontend runs on `http://localhost:5173`

## 📋 Demo Accounts

| Email | Password | Role |
|-------|----------|------|
| agent@example.com | password123 | Agent |
| customer1@example.com | password123 | Customer |
| customer2@example.com | password123 | Customer |
| admin@example.com | password123 | Admin |

## 🎬 Demo Workflow

### Workflow 1: Order Lookup

1. Login as `agent@example.com`
2. View Dashboard → Open "Order delivery delayed" ticket
3. Click "AI Investigation"
4. AI will call `lookupOrder` tool
5. Backend verifies customer authorization
6. AI explains delivery status with real data

### Workflow 2: Payment Investigation

1. Login as `agent@example.com`
2. View "Possible duplicate payment" ticket
3. Click "AI Investigation"
4. AI calls `investigatePayments` tool
5. Backend detects duplicate pattern (TXN-2003 and TXN-2004)
6. AI recommends human review

## 🔧 Key Features

### Backend
- JWT authentication with role-based access
- PostgreSQL with parameterized queries
- AI tool execution with customer authorization
- Duplicate payment detection algorithm
- Investigation result storage

### Frontend
- React with context-based auth
- Dashboard with ticket statistics
- Ticket management interface
- AI investigation panel
- Order and payment detail cards

### AI Integration
- OpenAI function calling
- Two specialized tools (lookupOrder, investigatePayments)
- Tool result validation
- Evidence-based recommendations
- Investigation history tracking

## 📁 Project Structure

```
ai-support-assistant/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & env config
│   │   ├── routes/          # API routes
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── ai/              # AI tools & prompts
│   │   ├── repositories/    # Database queries
│   │   ├── middleware/      # Auth & validation
│   │   ├── app.js           # Express app
│   │   └── server.js        # Entry point
│   ├── migrations/          # Database schema
│   └── seeds/               # Demo data
│
└── frontend/
    ├── src/
    │   ├── components/      # React components
    │   ├── pages/           # Page components
    │   ├── services/        # API clients
    │   ├── context/         # React context
    │   └── utils/           # Utilities
    └── public/              # Static assets
```

## 🔐 Security

- Password hashing with bcrypt
- JWT token authentication
- Role-based authorization
- Customer data ownership validation
- Parameterized SQL queries
- CORS configuration
- Helmet.js security headers

## 🛠️ Development

### Backend Commands
```bash
npm run dev      # Development with nodemon
npm start        # Production
npm run migrate  # Run migrations
npm run seed     # Seed demo data
```

### Frontend Commands
```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
```

## 📊 Database Schema

**Tables:**
- `users` - Customers, agents, and admins
- `orders` - Order records with delivery info
- `payments` - Transaction records
- `tickets` - Support tickets
- `ai_investigations` - AI tool results and recommendations

## 🔄 AI Tool Workflow

```
1. Agent views ticket
2. Agent clicks "AI Investigation"
3. Frontend calls POST /api/v1/ai/tickets/:id/investigate
4. Backend sends ticket to OpenAI with tool definitions
5. AI decides which tools to use
6. Backend executes tools with authorization checks
7. Backend sends tool results back to AI
8. AI generates recommendation
9. Backend stores investigation in database
10. Frontend displays results to agent
```

## 🎯 Next Steps (Phase 2)

- PDF upload troubleshooting workflow
- Knowledge base integration
- Ticket history analysis
- Auto-assignment logic
- Email notifications
- Analytics dashboard

## 📝 License

MIT

## 👨‍💻 Author

Built as a portfolio project demonstrating AI integration in real-world applications.

---

**Note**: This is a demonstration project. For production use, implement additional security measures, error handling, monitoring, and testing.
