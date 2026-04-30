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
- ✅ Fully typed with TypeScript
- ✅ Comprehensive test suite (Jest + Supertest + Playwright)
- ✅ Docker containerization
- ✅ Production-ready error handling and logging

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
- Password: `admin123`

**User Accounts:**
- Email: `user1@test.com` / `user2@test.com`
- Password: `user123`

## Configuration

### Environment Variables

See `.env.example` for all available options:

```env
DATABASE_URL="mysql://user:password@localhost:3306/greenquote"
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
4. **Amortization Schedule** - Detailed payment breakdown per offer
5. **PDF Export** - Download quotes as formatted documents
6. **CI/CD Pipeline** - GitHub Actions for automated testing/deployment
7. **GCP Deployment** - Cloud Run, Cloud SQL, Cloud Storage
8. **Caching Layer** - Redis for analytics and quote caching
9. **GraphQL API** - Optional GraphQL layer over existing REST API

## Deployment

### Docker

```bash
docker-compose up --build
```

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

- Structured JSON logging for all requests/errors
- Health check endpoint for monitoring
- Request/response logging in middleware
- Error tracking with stack traces

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
