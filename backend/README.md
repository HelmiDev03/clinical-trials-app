# ClinicalTrials Data Backend

Backend API for the Clinical Trials Application that acts as a proxy to ClinicalTrials.gov API.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with your configuration:
```
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080

# ClinicalTrials.gov API settings
API_BASE_URL=https://clinicaltrials.gov/api/v2
API_RATE_LIMIT=100
```

3. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

- `GET /api/trials` - Get clinical trials with filtering
- `GET /api/trials/:nctId` - Get specific trial details
- `GET /api/analytics/countries` - Get trials by country
- `GET /api/analytics/statuses` - Get trials by status
- `GET /api/analytics/phases` - Get trials by phase
- `GET /api/analytics/overview` - Get overview analytics

## Environment Variables

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS (http://localhost:8080)
- `API_BASE_URL` - ClinicalTrials.gov API base URL
- `API_RATE_LIMIT` - Rate limit for API requests per 15 minutes
