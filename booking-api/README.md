# High-Load Booking System

A production-grade event booking system built with NestJS that handles race conditions and prevents overselling through transactional booking logic.

## Core Challenge Solved

When 10 concurrent booking requests arrive for an event with only 2 remaining tickets, exactly 2 bookings succeed and 8 are gracefully rejected. No overselling. No crashes. No ambiguous states.

## Tech Stack

### Backend
- **NestJS** - Modular TypeScript framework with Dependency Injection
- **PostgreSQL** - ACID transactions with row-level locking
- **Prisma** - Schema-first ORM with type safety
- **JWT** - Secure authentication with access/refresh tokens
- **bcrypt** - Password hashing with salt rounds >= 10

### DevOps
- **Docker** - Containerized deployment
- **Docker Compose** - Multi-service orchestration
- **TypeScript** - Strict mode enabled

## Architecture Decisions

### Concurrency Handling
- **Pessimistic Locking**: Uses `SELECT ... FOR UPDATE` within serializable transactions
- **Artificial Delay**: 1-second delay simulates real-world payment processing
- **Atomic Operations**: Ticket decrement and booking creation in single transaction

### Authentication Strategy
- **JWT Tokens**: 15-minute access tokens, 7-day refresh tokens
- **Token Rotation**: Refresh tokens are invalidated on use
- **Secure Storage**: Tokens loaded from environment variables

### Database Design
- **Unique Constraints**: One booking per user per event
- **Optimistic Counting**: `remainingTickets` field for quick availability checks
- **Status Tracking**: CONFIRMED/CANCELLED booking states

## Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (if running locally)

### Quick Start with Docker

1. **Clone and setup:**
```bash
git clone <repository-url>
cd booking-system
cp .env.sample .env
```

2. **Start the entire system:**
```bash
docker-compose up --build
```

The system will:
- Start PostgreSQL with health checks
- Run database migrations
- Seed test data (3 users, 5 events including 1 with exactly 2 tickets)
- Start the API server on port 3001

### Local Development

1. **Install dependencies:**
```bash
npm install
```

2. **Setup environment:**
```bash
cp .env.sample .env
# Edit .env with your database credentials
```

3. **Database setup:**
```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

4. **Start development server:**
```bash
npm run start:dev
```

## API Documentation

### Authentication

#### POST /api/auth/register
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "name": "John Doe"
}
```

#### POST /api/auth/login
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

#### POST /api/auth/refresh
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Events

#### GET /api/events
Query parameters:
- `page` (default: 1)
- `limit` (default: 10, max: 50)
- `search` (filter by title, case-insensitive)
- `sortBy` (date, price, title - default: date)
- `sortOrder` (asc, desc - default: asc)

#### GET /api/events/:id
Returns single event by ID.

### Bookings (Protected)

#### POST /api/bookings
```json
{
  "eventId": "uuid"
}
```

#### GET /api/bookings
Returns all bookings for authenticated user.

#### DELETE /api/bookings/:id
Cancels a booking (increments remaining tickets).

## Concurrency Testing

### Run the Test Script

```bash
npm run test:concurrency
```

### Expected Output
```
=== Concurrency Test ===
Event: "Limited Concert" (2 tickets available)
Sending 10 simultaneous booking requests...
Results:
 Successful bookings: 2
 Rejected (no tickets): 8
  Total time: 1234ms

Final remaining tickets: 0

 TEST PASSED: No overselling detected
 Exactly 2 bookings succeeded
 8 bookings were rejected due to no tickets
 Event shows 0 remaining tickets
```

### Test Data
The seed script creates:
- **3 test users** with hashed passwords
- **5 events** including:
  - "Limited Concert" with exactly 2 tickets (perfect for race condition testing)
  - "Tech Conference 2025" with 100 tickets
  - "Business Summit" with 50 tickets
  - "Art Exhibition" with 30 tickets
  - "Food Festival" with 200 tickets

## Environment Variables

```bash
# Application
APP_PORT=3001
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/booking_db

# JWT
ACCESS_TOKEN_TIME=15m
ACCESS_TOKEN_SECRET=your-super-secret-access-token-here
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-here
REFRESH_TOKEN_TIME=7d
```

## Available Scripts

```bash
# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start with debugging
npm run build              # Build for production
npm run start:prod         # Start production build

# Database
npm run db:generate        # Generate Prisma client
npm run db:migrate         # Run migrations
npm run db:seed           # Seed test data

# Testing
npm run test               # Run unit tests
npm run test:concurrency   # Run concurrency test
npm run test:e2e          # Run end-to-end tests

# Code Quality
npm run lint               # Run ESLint
npm run format             # Format code with Prettier
```

## API Access

- **Base URL**: `http://localhost:3001/api`
- **Swagger Docs**: `http://localhost:3001/api` (when running)
- **Health Check**: API responds with 200 on root path

## Security Features

- **Password Validation**: Minimum 8 characters, at least one letter and one number
- **Email Validation**: Proper format checking
- **JWT Security**: Bearer token authentication
- **CORS Protection**: Configured for frontend origin
- **Input Validation**: Class-validator DTOs with sanitization
- **SQL Injection Prevention**: Prisma ORM with parameterized queries

## Key Implementation Details

### Race Condition Prevention
```typescript
// Pessimistic locking with FOR UPDATE
const event = await tx.$queryRaw<any[]>`
  SELECT * FROM "Event" WHERE id = ${eventId} FOR UPDATE
`;

// Check availability
if (event.remainingTickets <= 0) {
  throw new ConflictException('No tickets available');
}

// Artificial delay to simulate payment processing
await new Promise(resolve => setTimeout(resolve, 1000));

// Atomic update and booking creation
const [updatedEvent, booking] = await Promise.all([
  tx.event.update({
    where: { id: eventId },
    data: { remainingTickets: eventData.remainingTickets - 1 }
  }),
  tx.booking.create({ /* ... */ })
]);
```

### Transaction Isolation
- **Serializable Isolation Level**: Prevents all concurrency anomalies
- **Row-Level Locking**: `FOR UPDATE` locks specific event rows
- **Atomic Operations**: Both ticket decrement and booking creation succeed or fail together

## Known Limitations

1. **Single Instance**: Not designed for distributed systems
2. **Database Bottleneck**: All booking requests hit the same database
3. **Memory Usage**: No connection pooling configuration
4. **Monitoring**: No metrics or logging infrastructure

## Future Improvements

1. **Redis Caching**: Cache event data to reduce database load
2. **Rate Limiting**: Prevent abuse of booking endpoints
3. **WebSocket Updates**: Real-time ticket count updates
4. **Distributed Locking**: Redis-based locking for multi-instance deployments
5. **Circuit Breaker**: Handle database failures gracefully
6. **Metrics & Monitoring**: Prometheus/Grafana integration
7. **Queue System**: Asynchronous booking processing

## License

This project is provided as-is for educational and demonstration purposes.
