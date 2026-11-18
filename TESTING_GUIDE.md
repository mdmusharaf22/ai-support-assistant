# Testing Guide

Complete guide to test all features of the AI Support Resolution Assistant.

## Prerequisites

- ✅ Backend running on port 5000
- ✅ Frontend running on port 5173
- ✅ Database migrated and seeded
- ✅ OpenAI API key configured

## Test 1: Authentication

### Test Login
1. Go to `http://localhost:5173`
2. Enter credentials:
   - **Email**: `agent@example.com`
   - **Password**: `password123`
3. Click "Login"

**Expected**: Redirected to dashboard

### Test Invalid Login
1. Try logging in with wrong password
2. **Expected**: Error message "Invalid credentials"

### Test Logout
1. Click "Logout" in header
2. **Expected**: Redirected to login page

### Test Protected Routes
1. Logout if logged in
2. Try accessing `http://localhost:5173/dashboard`
3. **Expected**: Redirected to login

### Test Role-Based Access
1. Login as customer: `customer1@example.com` / `password123`
2. Try to run AI investigation
3. **Expected**: Button not visible or access denied

---

## Test 2: Dashboard

### View Statistics
1. Login as agent
2. View dashboard

**Expected to see**:
- Total tickets count
- Open tickets count
- In progress count
- Resolved count
- Order issues count
- Payment issues count
- Recent tickets list

### Verify Data
1. Check that statistics match seeded data:
   - At least 2 tickets total
   - 1 order issue
   - 1 payment issue
2. Click "View All" link
3. **Expected**: Navigate to tickets list

---

## Test 3: Ticket List

### View All Tickets
1. Navigate to "Tickets" from sidebar
2. **Expected**: See list of tickets with cards

### Test Filters
1. Select "Open" from status filter
2. **Expected**: Only open tickets shown
3. Select "Payment" from type filter
4. **Expected**: Only payment-related tickets shown
5. Reset filters (All Status, All Types)

### Click Ticket Card
1. Click any ticket card
2. **Expected**: Navigate to ticket details

---

## Test 4: Order Lookup Investigation

### Setup
1. Login as agent: `agent@example.com` / `password123`
2. Go to Tickets
3. Open ticket: "Order delivery delayed"

### Verify Ticket Display
**Expected to see**:
- Subject: "Order delivery delayed"
- Description with customer complaint
- Status badge
- Issue type: "order"
- Customer name
- Created date

### Run AI Investigation
1. Click "🤖 Run AI Investigation" button
2. Wait for processing (5-15 seconds)

**Expected behavior**:
- Button shows "🤖 Investigating..."
- No errors in console
- Investigation results appear

### Verify Results

**AI Response should contain**:
- Acknowledgment of the issue
- Order status information
- Expected delivery date
- Tracking status
- Helpful explanation
- Recommendation for next steps

**Tools Used section should show**:
- Tool name: `lookupOrder`
- Tool arguments: `{"orderNumber": "ORD-1002"}`

**Tool Result should display**:
- Order Number: ORD-1002
- Status: delayed
- Expected Delivery date
- Tracking Status: delayed

### Test Re-Investigation
1. Click "🔄 Re-run Investigation"
2. **Expected**: New investigation runs, results update

---

## Test 5: Payment Investigation

### Setup
1. Go back to Tickets list
2. Open ticket: "Possible duplicate payment"

### Run AI Investigation
1. Click "🤖 Run AI Investigation"
2. Wait for processing

### Verify Duplicate Detection

**AI Response should mention**:
- 2 transactions found
- Same amount detected
- Occurred close in time
- Recommends human review
- ⚠️ Warning indicators

**Tool Result should show**:
- Transactions Found: 2
- Possible Duplicate: ⚠️ Yes
- Requires Review: ⚠️ Human review required

**Transactions List should display**:
- TXN-2003: ₹999, success
- TXN-2004: ₹999, success
- Both with timestamps ~10 seconds apart

### Verify Logic
The duplicate detector should identify:
- Same customer
- Same order
- Same amount
- Both successful
- Within 5-minute window

---

## Test 6: Status Management

### Update Ticket Status
1. View any ticket as agent
2. Change status dropdown:
   - Try: In Progress
   - Try: Resolved
   - Try: Closed

**Expected**: Status updates immediately

### Verify Permission
1. Logout and login as customer
2. Try to change ticket status
3. **Expected**: Status dropdown not visible

---

## Test 7: Authorization Tests

### Test Customer Access
1. Login as `customer1@example.com` / `password123`
2. Go to Tickets
3. **Expected**: Only see own tickets (not customer2's tickets)

### Test Cross-Customer Access
1. As customer1, try to access customer2's ticket directly:
   - Get ticket ID of customer2's ticket from database
   - Navigate to `/tickets/{that_id}`
2. **Expected**: "Access denied" or ticket not found

### Test Agent Access
1. Login as agent
2. **Expected**: Can see all tickets
3. **Expected**: Can run AI investigations
4. **Expected**: Can update ticket status

---

## Test 8: Error Handling

### Test Invalid Ticket ID
1. Navigate to `/tickets/999999`
2. **Expected**: "Ticket not found" message

### Test Network Error
1. Stop backend server
2. Try to run AI investigation
3. **Expected**: Error message displayed
4. Restart backend

### Test Invalid OpenAI Key
1. Set wrong OPENAI_API_KEY in backend .env
2. Restart backend
3. Try AI investigation
4. **Expected**: Investigation fails with error
5. Fix API key and restart

---

## Test 9: Backend API Tests

### Test with curl or Postman

**Login**:
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"agent@example.com","password":"password123"}'
```

**Expected**: Returns token

**Get Tickets** (replace {TOKEN}):
```bash
curl http://localhost:5000/api/v1/tickets \
  -H "Authorization: Bearer {TOKEN}"
```

**Expected**: Returns tickets array

**AI Investigation**:
```bash
curl -X POST http://localhost:5000/api/v1/ai/tickets/1/investigate \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json"
```

**Expected**: Returns AI response and tool results

---

## Test 10: Database Verification

### Check Data Integrity

```sql
-- Connect to database
psql -U postgres -d ai_support_assistant

-- Check users
SELECT id, name, email, role FROM users;

-- Check tickets
SELECT id, subject, issue_type, status FROM tickets;

-- Check AI investigations
SELECT id, ticket_id, tool_name, created_at FROM ai_investigations;
```

### Verify Investigation Storage
1. Run AI investigation on a ticket
2. Query database:
```sql
SELECT * FROM ai_investigations 
WHERE ticket_id = 1 
ORDER BY created_at DESC 
LIMIT 1;
```

**Expected**: See stored investigation with:
- tool_name
- tool_result (JSON)
- recommendation
- model_name

---

## Test 11: Tool Authorization

### Test Unauthorized Order Access
1. As customer1, try to investigate customer2's order
2. Modify tool call manually (if testing backend directly)
3. **Expected**: Backend returns "access denied"

### Test Invalid Order Number
1. Manually modify ticket description to reference "ORD-9999"
2. Run AI investigation
3. **Expected**: Tool returns "Order not found"

---

## Test 12: UI Responsiveness

### Test Different Screen Sizes
1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test mobile view (375px)
4. Test tablet view (768px)
5. Test desktop view (1920px)

**Expected**: Layout adapts appropriately

---

## Test 13: Browser Compatibility

Test in:
- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari (if on Mac)

**Expected**: Works in all modern browsers

---

## Test 14: Performance

### Check Load Times
1. Open DevTools → Network tab
2. Reload dashboard
3. Check load times:
   - **Initial page load**: < 2 seconds
   - **API calls**: < 500ms
   - **AI investigation**: 5-15 seconds (normal)

### Check for Memory Leaks
1. Navigate between pages multiple times
2. Check DevTools → Memory tab
3. **Expected**: No continuous memory growth

---

## Test 15: Console Errors

### Frontend Console
1. Open browser DevTools → Console
2. Navigate through all pages
3. Run AI investigation

**Expected**: No errors (warnings are OK)

### Backend Console
1. Watch terminal running backend
2. Perform various actions

**Expected**: 
- Database queries logged
- No error messages
- AI tool calls logged

---

## Common Issues

### Investigation Fails
**Check**:
- [ ] OpenAI API key is valid
- [ ] API key has credits
- [ ] Model name supports function calling
- [ ] Backend logs show actual error

### Login Fails
**Check**:
- [ ] Database seeded properly
- [ ] Password: `password123`
- [ ] Email is exact match
- [ ] JWT_SECRET set in backend .env

### No Data Showing
**Check**:
- [ ] Run `npm run seed`
- [ ] Check database has data
- [ ] Backend is running
- [ ] CORS configured correctly

---

## Success Checklist

- [ ] Can login as agent
- [ ] Can login as customer
- [ ] Dashboard shows correct statistics
- [ ] Can view all tickets
- [ ] Can filter tickets
- [ ] Can view ticket details
- [ ] Can run order lookup investigation
- [ ] Can run payment investigation
- [ ] AI correctly identifies duplicates
- [ ] Tool results display properly
- [ ] Can update ticket status (as agent)
- [ ] Customer sees only own tickets
- [ ] No console errors
- [ ] Backend logs show tool execution
- [ ] Investigation saved to database

---

## Advanced Testing

### Test Multiple Tool Calls
Modify a ticket description to mention both order and payment:
```
"My order is late AND I was charged twice!"
```

**Expected**: AI calls both tools:
- lookupOrder
- investigatePayments

### Test Edge Cases
1. Order with no payments
2. Payment with no order
3. Multiple orders for same customer
4. Ticket with no issue_type

---

## Debugging Tips

**Enable verbose logging**:
```javascript
// backend/src/services/ai.service.js
console.log('Messages sent to AI:', messages);
console.log('Tool results:', toolResults);
```

**Check OpenAI usage**:
Visit https://platform.openai.com/usage

**Monitor database**:
```sql
-- Watch investigations in real-time
SELECT * FROM ai_investigations 
ORDER BY created_at DESC 
LIMIT 5;
```

---

## Report Issues

If tests fail, check:
1. All environment variables set
2. Database connection working
3. OpenAI API key valid
4. Ports 5000 and 5173 not in use
5. Node.js version 18+
6. PostgreSQL version 14+

Refer to SETUP_GUIDE.md for detailed troubleshooting.
