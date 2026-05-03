# Pino Observability Verification Guide

This guide walks you through verifying that Pino structured logging is working correctly in GreenQuote.

## Prerequisites

- App running locally with `npm run dev`
- MySQL container running via `docker-compose up -d`
- curl or Postman for API calls

---

## Step 1: Start the App with Pretty-Printing (Development)

This makes logs human-readable in your terminal:

```bash
LOG_LEVEL=debug LOG_PRETTY=true npm run dev
```

**Expected output:**
```
  6578 INFO: Server running on http://localhost:3000
  (notice colorized, formatted log output)
```

---

## Step 2: Test Health Check Endpoint

This is the simplest endpoint to verify basic logging:

```bash
curl http://localhost:3000/api/health
```

**Expected terminal output in Pino logs:**
```
  6578 INFO: Health check
  6579 INFO: Server running on http://localhost:3000
```

---

## Step 3: Test Registration with Validation Error

Trigger a Zod validation error by sending incomplete data:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid"}'
```

**Expected API response:**
```json
{
  "error": "Validation error",
  "details": [...]
}
```

**Expected Pino logs in terminal:**
```
  6580 ERROR: Validation error
    code: "invalid_string"
    path: ["password"]
    message: "String must contain at least 8 characters"
```

---

## Step 4: Test Successful Registration

Register a valid user:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPass123!"
  }'
```

**Expected API response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "...",
    "email": "testuser@example.com"
  }
}
```

**Expected Pino logs in terminal:**
```
  6581 INFO: User registered
    email: "testuser@example.com"
```

---

## Step 5: Test Login with Structured Error Logging

Try logging in with wrong password:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "wrongpassword"
  }'
```

**Expected API response:**
```json
{
  "error": "Invalid email or password"
}
```

**Expected Pino logs in terminal:**
```
  6582 ERROR: Authentication failed
    email: "admin@test.com"
    reason: "Invalid password"
```

---

## Step 6: Test Successful Login

Log in with correct credentials:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "AdminPass123!"
  }'
```

**Expected API response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "...",
    "email": "admin@test.com",
    "role": "admin"
  },
  "token": "eyJhbGc..."
}
```

**Expected Pino logs in terminal:**
```
  6583 INFO: User logged in
    email: "admin@test.com"
```

---

## Step 7: Test Production Mode (JSON Logs)

Stop the current dev server (Ctrl+C) and restart in production mode:

```bash
npm run build
npm run start
```

Or with default LOG_PRETTY=false:

```bash
npm run dev
```

Make an API call:

```bash
curl http://localhost:3000/api/health
```

**Expected terminal output (raw JSON):**
```json
{"level":30,"time":1746230400000,"pid":6584,"hostname":"YOUR-PC","msg":"Health check"}
```

This JSON format is perfect for cloud logging services like GCP Cloud Logging, AWS CloudWatch, etc.

---

## Step 8: Verify Log Levels

Test different log levels by changing the `LOG_LEVEL` env var:

```bash
# Only show errors and warnings
LOG_LEVEL=warn LOG_PRETTY=true npm run dev
```

Then trigger various endpoints - you'll only see WARN and ERROR logs.

```bash
# Show all logs including debug
LOG_LEVEL=debug LOG_PRETTY=true npm run dev
```

Now you should see detailed DEBUG logs for every operation.

---

## Structured Log Fields Reference

All Pino logs include these fields automatically:
- `level`: 30 (INFO), 40 (WARN), 50 (ERROR), 60 (FATAL)
- `time`: ISO 8601 timestamp
- `pid`: Process ID
- `hostname`: Machine name
- `msg`: Log message
- Custom fields: `email`, `error`, `userId`, `duration_ms`, etc.

---

## Troubleshooting

**No logs appearing?**
- Check `LOG_LEVEL` is set to `debug` or `info`
- Verify app is actually running: `curl http://localhost:3000/api/health`
- Check terminal is scrolled to see output

**Logs are JSON, not pretty?**
- Ensure `LOG_PRETTY=true` is set in environment
- Restart app after changing env var

**Missing structured fields?**
- Each error log should include context (email, error message, etc.)
- Check API route is passing fields to logger call

---

## Next Steps

Once you've verified logs are working:
1. ✅ Logs appear in terminal with `npm run dev`
2. ✅ Validation errors show structured fields
3. ✅ Login success logs include email
4. ✅ JSON format works in production
5. ✅ Request logging middleware is active across all API routes (includes status and latency)
