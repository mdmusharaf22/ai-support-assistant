# AI Support Resolution Assistant - Setup Guide

Complete step-by-step guide to get the application running locally.

## Prerequisites

Before starting, ensure you have:
- ✅ Node.js 18+ installed ([Download](https://nodejs.org/))
- ✅ PostgreSQL 14+ installed ([Download](https://www.postgresql.org/download/))
- ✅ OpenAI API key ([Get one](https://platform.openai.com/api-keys))
- ✅ Git (optional, for version control)

## Step 1: PostgreSQL Database Setup

### Option A: Using psql command line

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE ai_support_assistant;

# Exit
\q
```

### Option B: Using pgAdmin
1. Open pgAdmin
2. Right-click "Databases" → "Create" → "Database"
3. Name: `ai_support_assistant`
4. Click "Save"

### Verify Connection
Note your connection details:
- **Host**: `localhost`
- **Port**: `5432` (default)
- **Database**: `ai_support_assistant`
- **User**: `postgres` (or your PostgreSQL user)
- **Password**: (your PostgreSQL password)

## Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install
```

### Configure Environment

Create `.env` file in the `backend` folder:

```bash
# Copy example
cp .env.example .env

# Edit .env with your favorite editor
notepad .env   # Windows
nano .env      # Mac/Linux
```

Update these values in `.env`:

```env
PORT=5000

# Update with your PostgreSQL credentials
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/ai_support_assistant

# Generate a secure random string (or use this for development)
JWT_SECRET=your_super_secret_jwt_key_change_in_production

# Add your OpenAI API key
OPENAI_API_KEY=sk-your-openai-api-key-here

# Use a model that supports function calling
OPENAI_MODEL=gpt-4-turbo-preview

# Frontend URL (default Vite port)
FRONTEND_URL=http://localhost:5173
```

### Run Database Migrations

```bash
# Create tables
npm run migrate
```

Expected output:
```
Running migrations...
✓ Migrations completed successfully
```

### Seed Demo Data

```bash
# Insert demo users, orders, payments, and tickets
npm run seed
```

Expected output:
```
Running seed data...
✓ Seed data inserted successfully
```

### Start Backend Server

```bash
# Development mode with auto-reload
npm run dev
```

Expected output:
```
✓ Database connected: 2026-10-26...
✓ Server running on port 5000
✓ Environment: development
✓ Frontend URL: http://localhost:5173
```

**Keep this terminal open!**

## Step 3: Frontend Setup

Open a **new terminal** and run:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

### Configure Environment

Create `.env` file in the `frontend` folder:

```bash
# Copy example
cp .env.example .env
```

The `.env` should contain:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

### Start Frontend Server

```bash
npm run dev
```

Expected output:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**Keep this terminal open too!**

## Step 4: Test the Application

### Access the Application

Open your browser and go to:
```
http://localhost:5173
```

### Login as Agent

Use these credentials:
- **Email**: `agent@example.com`
- **Password**: `password123`

### Test Order Lookup Workflow

1. **View Dashboard** - You should see ticket statistics
2. **Click "View All"** or navigate to "Tickets"
3. **Open ticket**: "Order delivery delayed"
4. **Click "🤖 Run AI Investigation"**
5. **Watch the AI**:
   - Calls `lookupOrder` tool
   - Retrieves order ORD-1002 details
   - Shows status: "delayed"
   - Provides delivery information
6. **Review the AI recommendation**

### Test Payment Investigation Workflow

1. **Go back to Tickets**
2. **Open ticket**: "Possible duplicate payment"
3. **Click "🤖 Run AI Investigation"**
4. **Watch the AI**:
   - Calls `investigatePayments` tool
   - Detects transactions TXN-2003 and TXN-2004
   - Identifies same amount (₹999) within 10 seconds
   - Flags as possible duplicate
   - Recommends human review
5. **Review the detailed transaction analysis**

## Step 5: Verify Everything Works

### ✅ Checklist

- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 5173
- [ ] Can login successfully
- [ ] Dashboard shows statistics
- [ ] Can view ticket list
- [ ] Can view ticket details
- [ ] AI investigation works for order lookup
- [ ] AI investigation works for payment investigation
- [ ] Tool results display correctly
- [ ] No console errors

## Troubleshooting

### Backend won't start

**Error**: `Database connection error`
- ✅ Check PostgreSQL is running
- ✅ Verify DATABASE_URL in `.env`
- ✅ Ensure database exists: `psql -l | grep ai_support`
- ✅ Test connection: `psql -U postgres -d ai_support_assistant`

**Error**: `JWT_SECRET is required`
- ✅ Check `.env` file exists in backend folder
- ✅ Ensure JWT_SECRET is set

**Error**: `OpenAI API error`
- ✅ Check OPENAI_API_KEY is valid
- ✅ Verify API key has credits
- ✅ Test model name is correct (gpt-4-turbo-preview or gpt-4)

### Frontend won't start

**Error**: `Cannot find module`
- ✅ Run `npm install` again
- ✅ Delete `node_modules` and run `npm install`

**Error**: `EADDRINUSE :::5173`
- ✅ Port 5173 is already in use
- ✅ Close other Vite instances
- ✅ Or change port in `vite.config.js`

### AI Investigation Fails

**Error**: "Investigation failed"
- ✅ Check backend logs for detailed error
- ✅ Verify OpenAI API key is valid
- ✅ Ensure model supports function calling
- ✅ Check database has demo data

**Error**: "Access denied"
- ✅ Login as agent (not customer)
- ✅ Check JWT token is valid (try logout/login)

### No Data Showing

**Issue**: Dashboard shows all zeros
- ✅ Run seed script: `npm run seed`
- ✅ Check database has data: `psql -d ai_support_assistant -c "SELECT COUNT(*) FROM tickets;"`

## Development Tips

### View Backend Logs
All database queries and AI interactions are logged to the console where backend is running.

### View Frontend Errors
Open browser DevTools (F12) → Console tab

### Reset Database
```bash
# Backend directory
psql -U postgres -d ai_support_assistant -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
npm run migrate
npm run seed
```

### Test with Different Users

Login as customer:
- **Email**: `customer1@example.com`
- **Password**: `password123`
- Note: Customers can only see their own tickets

Login as admin:
- **Email**: `admin@example.com`
- **Password**: `password123`

## Next Steps

Once everything works:

1. **Explore the code**:
   - Backend AI tools: `backend/src/ai/`
   - Tool executor: `backend/src/ai/toolExecutor.js`
   - Payment detector: `backend/src/ai/paymentTools.js`

2. **Test edge cases**:
   - Invalid order numbers
   - Orders belonging to other customers
   - Multiple tool calls in one investigation

3. **Customize**:
   - Modify AI system prompt in `backend/src/ai/prompts.js`
   - Add new tool definitions
   - Adjust duplicate detection rules

4. **Extend**:
   - Add PDF upload workflow
   - Implement knowledge base
   - Create auto-assignment logic

## Need Help?

Common issues and solutions:
- **Port conflicts**: Change ports in .env files
- **Database permission errors**: Grant permissions to PostgreSQL user
- **Module not found**: Delete node_modules and reinstall
- **CORS errors**: Check FRONTEND_URL in backend .env matches your frontend URL

---

**Congratulations! 🎉**

You now have a working AI-powered support resolution system.

The AI can autonomously decide when to look up orders or investigate payments, all while your backend maintains full control over authorization and business logic.
