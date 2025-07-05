# ClinicalTrials Data - Clinical Trials Search & Analytics Platform

A full-stack web application that fetches clinical trial data directly from the ClinicalTrials.gov API and presents it in an interactive, user-friendly interface with comprehensive analytics and visualizations.



## 📋 Features

### ✅ Core Functionality
- **Real-time API Integration**: Fetches data directly from ClinicalTrials.gov API v2
- **Advanced Search & Filtering**: Search by condition, intervention, location, status, and phase
- **Interactive Data Visualization**: Charts and graphs showing clinical trial trends
- **Responsive Design**: Clean, modern UI that works on all devices

### 📊 Analytics & Visualizations
- **Overview Dashboard**: Key metrics and statistics
- **Status Analytics**: Distribution of trial statuses (pie charts)
- **Country Analytics**: Geographic distribution of trials (bar charts)
- **Phase Analytics**: Trial phases breakdown (bar charts)

### 🔍 Search & Filter Features
- **Text Search**: Search trial titles, conditions, and interventions
- **Status Filter**: Filter by recruitment status
- **Country Filter**: Filter by trial location
- **Phase Filter**: Filter by clinical trial phase
- **Real-time Results**: Debounced search with instant updates

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Recharts** for data visualization
- **React Query** for data fetching and caching
- **React Router** for navigation

### Backend
- **Node.js** with Express.js
- **Axios** for HTTP requests to ClinicalTrials.gov API
- **CORS** for cross-origin resource sharing
- **Helmet** for security headers
- **Rate limiting** for API protection
- **Compression** for response optimization


## 🚦 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Git

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/HelmiDev03/clinical-trials-app.git
   cd clinical-trials-app
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create .env file with your configuration (see Environment Variables section)
   npm run dev  # Starts on port 5000
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   # Create .env file with your configuration (see Environment Variables section)
   npm run dev  # Starts on port 8080
   ```

4. **Access the Application**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:5000

### Environment Variables

#### Backend (.env)
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080

# ClinicalTrials.gov API settings
API_BASE_URL=https://clinicaltrials.gov/api/v2
API_RATE_LIMIT=100
```

#### Frontend (.env)
```env
# Frontend Environment Variables
VITE_API_URL=http://localhost:5000/api
```

## 🔌 API Endpoints

### Trials
- `GET /api/trials` - Get clinical trials with filtering
  - Query params: `searchTerm`, `condition`, `country`, `status`, `phase`, `page`, `limit`
- `GET /api/trials/:nctId` - Get specific trial details

### Analytics
- `GET /api/analytics/countries` - Trials by country
- `GET /api/analytics/statuses` - Trials by status
- `GET /api/analytics/phases` - Trials by phase

### Server Health Check
- `GET /health` -  to check if the server is running

## 📊 Data Sources

This application uses the [ClinicalTrials.gov API v2](https://clinicaltrials.gov/api/gui/about) to fetch real-time clinical trial data. The API provides comprehensive information about clinical studies conducted around the world.

### API Integration Features
- **Real-time Data**: All data is fetched live from ClinicalTrials.gov
- **Advanced Filtering**: Supports complex search expressions
- **Rate Limiting**: Respects API rate limits and implements client-side rate limiting
- **Error Handling**: Robust error handling with fallbacks
- **Data Transformation**: Normalizes API responses for consistent frontend usage

## 🚀 Deployment

### Using Render (Recommended)

#### Backend Deployment
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**: Set production values

#### Frontend Deployment
1. Create a new Static Site on Render
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - **Environment Variables**: Set `VITE_API_URL` to your backend URL

### Manual Deployment

#### Backend
```bash
cd backend
npm install --production
npm start
```

#### Frontend
```bash
cd frontend
npm install
npm run build
# Serve the dist/ folder with your preferred static server
```

## 🧪 Development

### Code Style
- ESLint configuration included
- TypeScript strict mode enabled
- Prettier for code formatting

### Scripts

#### Backend
```bash
npm run dev      # Development with nodemon
npm start        # Production
npm test         # Run tests
```

#### Frontend
```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 📈 Performance Features

- **Debounced Search**: Reduces API calls while typing
- **Response Compression**: Gzip compression for API responses
- **Rate Limiting**: Prevents API abuse
- **Error Boundaries**: Graceful error handling
- **Loading States**: User-friendly loading indicators
- **Responsive Design**: Optimized for all screen sizes

## 🏗️ Frontend Architecture & Routing

The frontend application is built as a Single Page Application (SPA) with 4 main routes, each serving a specific purpose in the clinical trials analytics platform. The application uses React Router for client-side navigation and maintains a persistent sidebar for seamless user experience.

### Main Application Routes

#### 1. **Search Route** (`/`)
**Purpose**: Primary interface for searching and filtering clinical trials data

**Technical Implementation**:
- **Component**: `pages/Index.tsx` (main page component)
- **Key Features**:
  - Real-time search with debounced input (500ms delay)
  - Multi-criteria filtering (status, country, phase, condition)
  - Paginated results display with customizable page sizes
  - Data table with sortable columns and trial details

**Data Flow**:
```
User Input → SearchBar Component → API Service → Backend /api/trials → ClinicalTrials.gov API
↓
Results → TrialTable Component → Rendered table with pagination
```

**Key Components**:
- `SearchBar.tsx`: Handles search input with debouncing
- `FilterPanel.tsx`: Manages filter state and UI
- `TrialTable.tsx`: Displays paginated trial results
- Custom hooks for data fetching and state management

#### 2. **Phase Analytics Route** (`/analytics/phases`)
**Purpose**: Visualizes distribution of clinical trials by their development phases

**Technical Implementation**:
- **Component**: `components/analytics/PhaseAnalytics.tsx`
- **Data Source**: `/api/analytics/phases` endpoint
- **Visualization**: Interactive bar charts using Recharts library

**Phase Categories Analyzed**:
- Phase 1: Early safety testing
- Phase 2: Efficacy and side effects
- Phase 3: Large-scale testing
- Phase 4: Post-market surveillance
- Not Applicable: Non-interventional studies

**Data Processing**:
```
API Call → Phase Analytics Service → Data Aggregation → Chart Rendering
├── Counts trials by phase
├── Calculates percentages
└── Formats data for visualization
```

#### 3. **Status Analytics Route** (`/analytics/statuses`)
**Purpose**: Shows recruitment and completion status distribution of trials

**Technical Implementation**:
- **Component**: `components/analytics/StatusAnalytics.tsx`
- **Data Source**: `/api/analytics/statuses` endpoint
- **Visualization**: Pie charts and summary cards

**Status Categories**:
- Recruiting: Actively enrolling participants
- Completed: Finished enrollment and follow-up
- Not yet recruiting: Approved but not started
- Active, not recruiting: Ongoing but closed to new participants
- Suspended/Terminated: Halted trials

**Features**:
- Interactive pie chart with hover details
- Percentage calculations with visual indicators
- Color-coded status representation
- Real-time data updates

#### 4. **Country Analytics Route** (`/analytics/countries`)
**Purpose**: Geographic distribution analysis of clinical trials worldwide

**Technical Implementation**:
- **Component**: `components/analytics/CountryAnalytics.tsx`
- **Data Source**: `/api/analytics/countries` endpoint
- **Visualization**: Horizontal bar charts for top countries

**Geographic Analysis Features**:
- Top 20 countries by trial count
- Percentage of global trials per country
- Regional trends and patterns
- Interactive chart elements

**Data Structure**:
```javascript
{
  country: "United States",
  trialCount: 15420,
  percentage: 45.2
}
```

### Persistent Sidebar Navigation

**Component**: `components/Sidebar.tsx`

**Technical Details**:
- Responsive design (collapsible on mobile)
- Active route highlighting
- Smooth transitions and animations
- Accessibility features (ARIA labels, keyboard navigation)

**Navigation Structure**:
```
├── ClinicalTrials Data (Logo/Brand)
├── 🔍 Search Trials (/)
├── 📊 Phase Analytics (/analytics/phases)
├── 📈 Status Analytics (/analytics/statuses)
└── 🌍 Country Analytics (/analytics/countries)
```

### Shared Components & Services

#### API Service Layer (`services/apiService.ts`)
- Centralized HTTP client using Axios
- Request/response interceptors
- Error handling and retry logic
- TypeScript interfaces for type safety

#### Reusable UI Components
- Chart wrapper components with consistent styling
- Loading states and error boundaries
- Responsive data tables
- Filter components with state management

#### State Management Strategy
- React Query for server state management
- Local state for UI interactions
- Context API for global app state
- Custom hooks for business logic

### Performance Optimizations

#### Client-Side Optimizations
- **Debounced Search**: Reduces API calls during typing
- **Memoized Components**: React.memo for expensive renders
- **Lazy Loading**: Code splitting for route-based chunks
- **Virtual Scrolling**: For large data sets (future enhancement)

#### Data Caching Strategy
- React Query cache with stale-while-revalidate
- 5-minute cache for analytics data
- Background refetching for real-time updates
- Optimistic updates for better UX

### Error Handling & User Experience

#### Error Boundaries
- Component-level error catching
- Graceful fallback UI
- Error reporting and logging
- Recovery mechanisms

#### Loading States
- Skeleton components during data fetching
- Progressive loading for large datasets
- Smooth transitions between states
- User feedback for long operations

This architectural approach ensures scalability, maintainability, and excellent user experience while providing comprehensive clinical trials analytics and search capabilities.

## 🔒 Security

- **Helmet.js**: Security headers
- **CORS**: Configured for cross-origin requests
- **Rate Limiting**: API abuse prevention
- **Input Validation**: Server-side validation
- **Environment Variables**: Sensitive data protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 Technical Decisions

### Frontend Architecture
- **React with TypeScript**: Type safety and modern development experience
- **Component-based Architecture**: Reusable and maintainable components
- **Custom Hooks**: Shared logic abstraction
- **Service Layer**: Clean separation of API calls

### Backend Architecture
- **Express.js**: Lightweight and flexible Node.js framework
- **Service Layer Pattern**: Business logic separation
- **Middleware Stack**: Security, compression, and request processing
- **Error Handling**: Centralized error management

### API Design
- **RESTful Routes**: Clear and predictable endpoint structure
- **Query Parameters**: Flexible filtering options
- **Consistent Responses**: Standardized API response format
- **Error Responses**: Detailed error information

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure frontend URL is in backend CORS configuration
2. **API Rate Limiting**: ClinicalTrials.gov API has rate limits - implement caching if needed
3. **Build Errors**: Check Node.js version compatibility
4. **Environment Variables**: Ensure all required env vars are set

### Debug Mode
Set `NODE_ENV=development` in backend to enable detailed error messages.



## 🙏 Acknowledgments

- [ClinicalTrials.gov](https://clinicaltrials.gov/) for providing the clinical trials data API
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Recharts](https://recharts.org/) for the data visualization library
- [React](https://reactjs.org/) and [Express.js](https://expressjs.com/) communities

---


