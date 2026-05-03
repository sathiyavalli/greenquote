# Request Logging Middleware - Usage Guide

## Overview

The `src/lib/logging-middleware.ts` provides two patterns for adding request/response timing to API routes:

1. **Wrapper Pattern** - Full error handling and automatic response wrapping
2. **Manual Pattern** - Fine-grained control for complex routes

---

## Pattern 1: Wrapper Pattern (Recommended for Simple Routes)

Best for straightforward endpoints that return a single response.

### Before (Current Health Check)
```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    logger.info('Health check');
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    logger.error('Health check failed', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    return NextResponse.json(
      { error: 'Health check failed' },
      { status: 500 }
    );
  }
}
```

### After (With Request Logging Middleware)
```typescript
// src/app/api/health/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withRequestLogging } from '@/lib/logging-middleware';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  return withRequestLogging(request, async () => {
    logger.info('Health check');
    return NextResponse.json({ status: 'ok' });
  });
}
```

**Output in Pino logs:**
```json
{
  "level": 30,
  "time": 1746230400123,
  "msg": "API request completed",
  "method": "GET",
  "path": "/api/health",
  "status": 200,
  "duration_ms": 12,
  "timestamp": "2026-05-02T10:00:00.123Z"
}
```

---

## Pattern 2: Manual Pattern (For Complex Routes with Multiple Responses)

Better for routes with early returns or conditional logic.

### Before (Current Register Route)
```typescript
// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/utils/validation';
import { authService } from '@/services/authService';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const input = await request.json();
    const validatedData = registerSchema.parse(input);

    const user = await authService.registerUser(
      validatedData.email,
      validatedData.password
    );

    logger.info('User registered', { email: user.email });

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: { id: user.id, email: user.email },
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Registration error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 400 }
    );
  }
}
```

### After (With Request Logging Middleware)
```typescript
// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { logRequestStart, logRequestEnd } from '@/lib/logging-middleware';
import { registerSchema } from '@/utils/validation';
import { authService } from '@/services/authService';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const startTime = logRequestStart(request);

  try {
    const input = await request.json();
    const validatedData = registerSchema.parse(input);

    const user = await authService.registerUser(
      validatedData.email,
      validatedData.password
    );

    logger.info('User registered', { email: user.email });

    const response = NextResponse.json(
      {
        message: 'User registered successfully',
        user: { id: user.id, email: user.email },
      },
      { status: 201 }
    );

    logRequestEnd(request, startTime, response.status);
    return response;
  } catch (error) {
    logger.error('Registration error', {
      error: error instanceof Error ? error.message : String(error),
    });

    const response = NextResponse.json(
      { error: 'Registration failed' },
      { status: 400 }
    );

    logRequestEnd(request, startTime, response.status);
    return response;
  }
}
```

**Output in Pino logs:**
```json
{
  "level": 10,
  "time": 1746230400100,
  "msg": "API request started",
  "method": "POST",
  "path": "/api/auth/register",
  "timestamp": "2026-05-02T10:00:00.100Z"
}
```

```json
{
  "level": 30,
  "time": 1746230400145,
  "msg": "API request completed",
  "method": "POST",
  "path": "/api/auth/register",
  "status": 201,
  "duration_ms": 45,
  "timestamp": "2026-05-02T10:00:00.145Z"
}
```

---

## Log Fields Explained

| Field | Example | Purpose |
|-------|---------|---------|
| `method` | `"GET"` | HTTP method |
| `path` | `"/api/health"` | Request path |
| `status` | `200` | HTTP status code |
| `duration_ms` | `12` | Time in milliseconds |
| `timestamp` | `"2026-05-02T10:00:00.123Z"` | ISO 8601 timestamp |
| `error` | `"Email already exists"` | Error message (failed requests only) |

---

## Implementation Strategy

### Phase 1 (Quick Win)
Add to simple routes first:
- ✅ `GET /api/health` (easiest, 1 minute)
- ✅ `GET /api/admin/stats` (simple read, 2 minutes)
- ✅ `POST /api/auth/login` (common endpoint, 3 minutes)

### Phase 2 (Core APIs)
Add to all Quote endpoints:
- `GET /api/quotes`
- `POST /api/quotes`
- `GET /api/quotes/[id]`
- `DELETE /api/quotes/[id]`

### Phase 3 (Optional)
Add to Admin endpoints:
- `GET /api/admin/quotes`
- `GET /api/admin/users`
- `PUT /api/admin/users/[userId]`

---

## Verification After Implementation

Start app with debug logging:
```bash
LOG_LEVEL=debug LOG_PRETTY=true npm run dev
```

Make requests and verify output:
```bash
curl http://localhost:3000/api/health
```

Terminal output should show:
```
  6590 DEBUG: API request started
    method: "GET"
    path: "/api/health"
  
  6590 INFO: Health check
  
  6590 INFO: API request completed
    method: "GET"
    path: "/api/health"
    status: 200
    duration_ms: 5
```

---

## Benefits

✅ **Performance Monitoring** - Track endpoint latency over time  
✅ **Debugging** - See exact timing for each request  
✅ **Cloud Logging** - JSON format ready for GCP/AWS/Datadog  
✅ **SLA Tracking** - Identify slow endpoints (>100ms, >500ms, >1s)  
✅ **Error Context** - Know which routes are failing most  
✅ **No Breaking Changes** - Additive only, doesn't modify endpoint behavior
