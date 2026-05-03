# GreenQuote - Solar Financing Pre-Qualification Platform

A full-stack TypeScript application for solar financing pre-qualification built with Next.js, Prisma, and MySQL.

## Features

- ✅ User registration and authentication (email/password)
- ✅ Secure JWT-based sessions
- ✅ Quote creation with automatic pricing calculation
- ✅ Risk band assessment (A/B/C)
- ✅ Monthly payment calculations for 5/10/15 year terms
- ✅ User-specific quote management
- ✅ Admin dashboard for quote management and filtering
- ✅ Table-based quote views for both users and admins
- ✅ Fully typed with TypeScript
- ✅ Comprehensive test suite (Jest + Supertest + Playwright)
- ✅ Docker containerization
- ✅ Production-ready error handling and logging
- ✅ Print-ready quote export (PDF via browser Print/Save as PDF)
- ✅ **[NEW] Detailed amortization schedules** - View month-by-month payment breakdowns for each financing option

## Tech Stack

**Frontend:**
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- React Hook Form
- Zod validation

**Backend:**
- Next.js API Routes
- Node.js
- TypeScript
- JWT authentication
- Pino structured logging

**Database:**
- MySQL 8.0+
- Prisma ORM
- Type-safe queries

**Testing:**
- Jest (unit tests)
- Supertest (integration tests)
- Playwright (E2E tests)

**Infrastructure:**
- Docker
- Docker Compose

## Prerequisites

- Node.js 18+
- npm or yarn
- Docker & Docker Compose (for local MySQL)
- Git

## Installation

1. Clone the repository
```bash
git clone <repo>
cd greenquote
```

2. Install dependencies
```bash
npm install
```

3. Setup environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start MySQL using Docker Compose
```bash
docker-compose up -d
```

MySQL is exposed on `localhost:3307` and matches the default `.env.example` connection settings.

5. Run Prisma migrations
```bash
npm run prisma:migrate
```

6. Seed the database
```bash
npm run db:seed
```

## Running the App

### Development
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production
```bash
npm run build
npm run start
```

## Testing

### Unit Tests
```bash
npm run test
```

### Watch Mode
```bash
npm run test:watch
```

### Integration Tests
```bash
npm run test:api
```

### End-to-End Tests
```bash
npm run test:e2e
```

Includes a Playwright flow for: sign-in -> create quote -> view quote results.

### All Tests
```bash
npm run test:all
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out

### Quotes
- `POST /api/quotes` - Create new quote
- `GET /api/quotes` - List user's quotes
- `GET /api/quotes/:id` - Get quote details

### Admin
- `GET /api/admin/quotes` - List all quotes (admin only)
- `GET /api/admin/quotes?search=...&riskBand=...` - Filter quotes

### Health
- `GET /api/health` - Health check

### API Docs
- `GET /api/openapi` - OpenAPI specification (JSON)
- `GET /api/docs` - Swagger UI (auto-rendered docs)
- `GET /docs` - Embedded docs page in app

## Project Structure

```
greenquote/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── api/            # API routes
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page
│   ├── components/         # React components
│   ├── lib/                # Utilities (JWT, Prisma)
│   ├── middleware/         # Authentication middleware
│   ├── services/           # Business logic
│   ├── repositories/       # Data access
│   ├── types/              # TypeScript types
│   └── utils/              # Helpers (validation, errors, etc.)
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed data
├── tests/
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── e2e/                # E2E tests
├── docs/                   # Documentation
└── package.json            # Dependencies

```

## Default Credentials

For testing (from seed data):

**Admin Account:**
- Email: `admin@test.com`
- Password: `AdminPass123!`

**User Accounts:**
- Email: `john@example.com` / `jane@example.com`
- Passwords: `UserPass456!` / `UserPass789!`

## Configuration

### Environment Variables

See `.env.example` for all available options:

```env
DATABASE_URL="mysql://user:password@localhost:3307/greenquote"
JWT_SECRET="your-secret-key"
NODE_ENV="development"
```

## Design Decisions

### Why Prisma?
- Type-safe database access with auto-generated types
- Automatic migration management
- Supports multiple databases (MySQL, PostgreSQL, etc.)
- Superior developer experience

### Why Next.js API Routes?
- Full-stack JavaScript solution reduces context switching
- Built-in middleware support
- Fast development and deployment
- No separate server needed

### Why JWT?
- Stateless authentication (scales horizontally)
- No session storage required
- Easy to extend for OAuth later
- Simple to test

### Why MySQL + Normalized Schema?
- Relational data structure (Users, Quotes, Offers)
- Efficient querying with indexes
- Supports complex filtering (admin dashboard)
- Scalable for production

## What's Next?

The following features are designed to be added incrementally:

1. **OAuth Integration** - Google/GitHub login via Keycloak
2. **Advanced Analytics** - Dashboard with quote trends and metrics
3. **Email Notifications** - Quote confirmations and updates
4. **Schedule Visualization** - Charts showing principal vs. interest breakdown
5. **Early Payoff Calculator** - Show impact of extra monthly payments
6. **CI/CD Pipeline** - GitHub Actions for automated testing/deployment
7. **GCP Deployment** - Cloud Run, Cloud SQL, Cloud Storage
8. **Caching Layer** - Redis for analytics and quote caching
9. **GraphQL API** - Optional GraphQL layer over existing REST API

## Deployment

### Docker

```bash
docker-compose up --build
```

When running in containers, startup applies Prisma migrations before launching the app.

### GCP Cloud Run

```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/greenquote
gcloud run deploy greenquote --image gcr.io/PROJECT_ID/greenquote --platform managed
```

## Performance & Scalability

- Database indexes on frequently queried columns (userId, createdAt, riskBand)
- Prisma connection pooling
- API response caching (future)
- Rate limiting (future)
- CDN for static assets (future)

## Monitoring & Logging

- Structured JSON logging with Pino for request, response, and error paths across all API routes
- Human-readable logs in development via pino-pretty
- Health check endpoint for monitoring
- Configurable log levels via environment variables
- Error tracking with stack traces

### Pino Configuration

Use these environment variables (already included in `.env.example`):

```env
LOG_LEVEL="info"
LOG_PRETTY="true"
```

- `LOG_LEVEL`: one of `fatal`, `error`, `warn`, `info`, `debug`, `trace`
- `LOG_PRETTY`: `true` for formatted local logs, `false` for raw JSON (recommended in production)

### Verify Observability Locally

1. Start app:
```bash
npm run dev
```

2. Trigger API route (example):
```bash
curl http://localhost:3000/api/health
```

3. Confirm terminal logs include structured Pino entries for errors and operational events.

## Amortization Schedules

View detailed month-by-month payment breakdowns for your solar financing options:

1. Navigate to any quote in **My Solar Quotes**
2. In the **Your Financing Options** section, click **"View Amortization Schedule"** on any term
3. The schedule expands to show:
   - First 12 months of payments by default
   - Month number, payment date, principal/interest split, and remaining balance
   - Total interest cost and total amount paid
4. Click **"Show All Payments"** to view the complete schedule for the entire loan term
5. Use this information to understand your long-term financing commitment

For detailed information, see [AMORTIZATION_SCHEDULE.md](AMORTIZATION_SCHEDULE.md)

## Quote Export (PDF)

Quotes can be exported as PDF from the quote details page:

1. Open any quote details page (`/quotes/:id`)
2. Click **Print Quote**
3. In the browser print dialog, select **Save as PDF**

The app includes print-friendly styles (`print-hidden`) so navigation and action controls are excluded from exported documents.

## Security

- Password hashing with bcryptjs
- JWT token-based authentication
- Authorization checks on protected endpoints
- Input validation with Zod on all API endpoints
- CORS middleware (future)
- Rate limiting (future)
- SQL injection protection via Prisma

## Contributing

1. Create a feature branch
2. Make changes with clear commits
3. Write/update tests
4. Submit PR with description

## License

MIT

## Support

For issues or questions, create a GitHub issue or contact the team.

---

**Built with ❤️ by the GreenQuote team**

Last updated: April 29, 2026
