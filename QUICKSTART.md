# JustEat Quick Start Guide

## Local Development Setup

### Option 1: Docker (Recommended)

```bash
# Create environment file
cp backend/.env.example backend/.env
# Edit backend/.env with your settings

cp frontend/.env.example frontend/.env
# Edit frontend/.env with your settings

# Start all services
docker-compose up -d

# Run database seed data (in another terminal)
docker exec justeat_api python seed/data.py

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Option 2: Local Development

#### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your database settings

# Set up database (PostgreSQL must be running)
alembic upgrade head

# Run database seed (optional)
python seed/data.py

# Start server
python run.py
# Backend runs on http://localhost:8000
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
# Frontend runs on http://localhost:3000
```

## Testing

### Run Backend Tests

```bash
cd backend
pytest -q  # Run all tests
pytest tests/test_auth.py -v  # Run specific test file
```

### Run Frontend (if tests added)

```bash
cd frontend
npm test
```

## Database Seeding

Add test data to a fresh database:

```bash
cd backend

# Option 1: Using Python directly
python seed/data.py

# Option 2: Using Docker
docker exec justeat_api python seed/data.py
```

This creates:

- 3 test customers (alice, bob, charlie)
- 2 test owners (owner1, owner2)
- 3 test restaurants
- 6 menu items
- 2 sample orders

**Test Login Credentials:**

- Customer: alice@test.com / password123
- Owner: owner1@test.com / password123

## API Documentation

Access interactive API docs:

```
http://localhost:8000/docs
```

## Database Schema

View current schema:

```bash
cd backend

# List all migrations
alembic history

# Create a new migration (after model changes)
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head
```

## Environment Variables

### Backend (.env)

Key variables:

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET_KEY`: Secret key for JWT tokens (change in production!)
- `APP_ENV`: development/production
- `ALLOWED_ORIGINS`: CORS allowed origins

### Frontend (.env)

Key variables:

- `VITE_API_URL`: Backend API URL (default: http://localhost:8000/api)

## Common Issues

**Port already in use:**

```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Database connection error:**

- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database exists and migrations ran

**Frontend can't reach API:**

- Check VITE_API_URL in frontend/.env
- Verify backend is running on http://localhost:8000
- Check CORS settings in backend/.env

## Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for production deployment on Azure.
